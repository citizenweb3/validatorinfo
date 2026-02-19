import { Abi, getAddress } from 'viem';

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { contracts, getL1, rollupAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { AddChainProps, GetNodeRewards, NodesRewards } from '@/server/tools/chains/chain-indexer';
import { getChainParams } from '@/server/tools/chains/params';
import { getOrCreateViemClient } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError, logWarn } = logger('aztec-node-rewards');

const CHUNK_SIZE = 100;

const fetchNodeReward = async (
  node: { operatorAddress: string },
  chainName: string,
  dbChainId: number,
  client: ReturnType<typeof getOrCreateViemClient>,
  rollupAddress: `0x${string}`,
  rollupAbi: Abi,
): Promise<NodesRewards & { addressType: 'coinbase' | 'operator' | null }> => {
  let operatorAddress: `0x${string}`;

  try {
    operatorAddress = getAddress(node.operatorAddress);
  } catch {
    return { address: node.operatorAddress, rewards: '0', addressType: null };
  }

  let coinbaseSplitAddress: `0x${string}` | null = null;
  try {
    const stakedEvent = await eventsClient.aztecStakedEvent.findFirst({
      where: { chainId: dbChainId, attesterAddress: operatorAddress },
      orderBy: { blockNumber: 'desc' },
    });

    if (stakedEvent?.coinbaseSplitContractAddress) {
      try {
        coinbaseSplitAddress = getAddress(stakedEvent.coinbaseSplitContractAddress);
      } catch {
        // Invalid coinbase address — skip it
      }
    }
  } catch {
    // Failed to fetch coinbase — will use operator address
  }

  const addressesToTry: Array<{ address: `0x${string}` | null; type: 'coinbase' | 'operator' }> = [
    { address: coinbaseSplitAddress, type: 'coinbase' },
    { address: operatorAddress, type: 'operator' },
  ];

  for (const { address, type } of addressesToTry) {
    if (!address) continue;

    try {
      const rewards = (await client.readContract({
        address: rollupAddress,
        abi: rollupAbi,
        functionName: 'getSequencerRewards',
        args: [getAddress(address)],
      })) as bigint;

      if (rewards > BigInt(0)) {
        return { address: operatorAddress, rewards: rewards.toString(), addressType: type };
      }
    } catch (error: any) {
      logWarn(`${chainName}: Failed to fetch rewards for ${operatorAddress} via ${type}: ${error.message}`);
    }
  }

  return { address: operatorAddress, rewards: '0', addressType: null };
};

const getNodeRewards: GetNodeRewards = async (chain: AddChainProps) => {
  try {
    const chainName = chain.name as 'aztec' | 'aztec-testnet';

    const l1Chain = getChainParams(getL1[chainName]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      logError(`${chainName}: No L1 RPC URLs found`);
      return [];
    }

    const client = getOrCreateViemClient(l1RpcUrls, `${chainName}-node-rewards`);

    const rollupAddress = contracts[chainName].rollupAddress as `0x${string}`;
    const rollupAbi = rollupAbis[chainName] as Abi;

    const dbChain = await db.chain.findFirst({ where: { chainId: chain.chainId } });
    if (!dbChain) {
      logError(`${chainName}: Chain not found in database`);
      return [];
    }

    const nodes = await db.node.findMany({
      where: { chainId: dbChain.id },
      select: { operatorAddress: true },
    });

    if (!nodes.length) {
      logInfo(`${chainName}: No nodes found`);
      return [];
    }

    logInfo(`${chainName}: Fetching rewards for ${nodes.length} nodes (chunks of ${CHUNK_SIZE})`);

    const nodesRewards: NodesRewards[] = [];
    let rewardsViaCoinbase = 0;
    let rewardsViaOperatorAddress = 0;
    let nodesWithZeroRewards = 0;

    for (let i = 0; i < nodes.length; i += CHUNK_SIZE) {
      const chunk = nodes.slice(i, i + CHUNK_SIZE);

      for (const node of chunk) {
        try {
          const result = await fetchNodeReward(node, chainName, dbChain.id, client, rollupAddress, rollupAbi);
          nodesRewards.push({ address: result.address, rewards: result.rewards });

          if (result.addressType && result.rewards !== '0') {
            if (result.addressType === 'coinbase') rewardsViaCoinbase++;
            else rewardsViaOperatorAddress++;
          } else {
            nodesWithZeroRewards++;
          }
        } catch (error: any) {
          logError(`${chainName}: Error processing node ${node.operatorAddress}: ${error.message}`);
          nodesRewards.push({ address: node.operatorAddress, rewards: '0' });
        }
      }

      // Write chunk to DB immediately
      const chunkRewards = nodesRewards.splice(0, nodesRewards.length);
      const rewardsToWrite = chunkRewards.filter((r) => r.rewards && r.rewards !== '0' && r.address);

      if (rewardsToWrite.length > 0) {
        await db.$transaction(
          rewardsToWrite.map((r) =>
            db.node.updateMany({
              where: { operatorAddress: r.address! },
              data: { outstandingRewards: r.rewards },
            }),
          ),
        );
      }

      const processed = Math.min(i + CHUNK_SIZE, nodes.length);
      logInfo(`${chainName}: Processed ${processed}/${nodes.length} nodes, wrote ${rewardsToWrite.length} rewards`);
    }

    logInfo(
      `${chainName}: Done. Coinbase: ${rewardsViaCoinbase}, Operator: ${rewardsViaOperatorAddress}, Zero: ${nodesWithZeroRewards}`,
    );

    // Return empty — all writes are done inside chunks
    return [];
  } catch (error: any) {
    logError(`Failed to fetch Aztec node rewards: ${error.message}`);
    return [];
  }
};

export default getNodeRewards;
