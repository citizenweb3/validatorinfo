import { Abi, getAddress } from 'viem';

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { contracts, getL1, rollupAbis } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { AddChainProps, GetNodeRewards, NodesRewards } from '@/server/tools/chains/chain-indexer';
import { getChainParams } from '@/server/tools/chains/params';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError, logWarn } = logger('aztec-node-rewards');

const getNodeRewards: GetNodeRewards = async (chain: AddChainProps) => {
  try {
    const chainName = chain.name as 'aztec' | 'aztec-testnet';
    const nodesRewards: NodesRewards[] = [];

    const l1Chain = getChainParams(getL1[chainName]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      logError(`${chainName}: No L1 RPC URLs found - cannot fetch node rewards`);
      return [];
    }

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-node-rewards`,
    });

    const rollupAddress = contracts[chainName].rollupAddress as `0x${string}`;
    const rollupAbi = rollupAbis[chainName] as Abi;

    const dbChain = await db.chain.findFirst({
      where: { chainId: chain.chainId },
    });

    if (!dbChain) {
      logError(`${chainName}: Chain not found in database`);
      return [];
    }

    const nodes = await db.node.findMany({
      where: { chainId: dbChain.id },
      select: {
        operatorAddress: true,
      },
    });

    if (!nodes.length) {
      logInfo(`${chainName}: No nodes found in database`);
      return [];
    }

    logInfo(`${chainName}: Fetching rewards for ${nodes.length} nodes`);

    let rewardsViaCoinbase = 0;
    let rewardsViaOperatorAddress = 0;
    let nodesWithZeroRewards = 0;

    for (const node of nodes) {
      try {
        let operatorAddress: `0x${string}`;

        try {
          operatorAddress = getAddress(node.operatorAddress);
        } catch (error: any) {
          logError(`${chainName}: Invalid operator address ${node.operatorAddress}: ${error.message}`);
          continue;
        }

        let coinbaseSplitAddress: `0x${string}` | null = null;
        try {
          const stakedEvent = await eventsClient.aztecStakedEvent.findFirst({
            where: {
              chainId: dbChain.id,
              attesterAddress: operatorAddress,
            },
            orderBy: {
              blockNumber: 'desc',
            },
          });

          if (stakedEvent?.coinbaseSplitContractAddress) {
            try {
              coinbaseSplitAddress = getAddress(stakedEvent.coinbaseSplitContractAddress);
            } catch (error: any) {
              logWarn(
                `${chainName}: Invalid coinbase split address ${stakedEvent.coinbaseSplitContractAddress} for node ${operatorAddress}: ${error.message}`,
              );
            }
          }
        } catch (error: any) {
          logWarn(`${chainName}: Failed to fetch coinbase split address for ${operatorAddress}: ${error.message}`);
        }

        const addressesToTry: Array<{
          address: `0x${string}` | null;
          type: 'coinbase' | 'operator';
        }> = [
          { address: coinbaseSplitAddress, type: 'coinbase' },
          { address: operatorAddress, type: 'operator' },
        ];

        let finalRewards = '0';
        let successfulAddressType: 'coinbase' | 'operator' | null = null;

        for (const { address, type } of addressesToTry) {
          if (!address) continue;

          try {
            const validatedAddress = getAddress(address);

            const rewards = (await client.readContract({
              address: rollupAddress,
              abi: rollupAbi,
              functionName: 'getSequencerRewards',
              args: [validatedAddress],
            })) as bigint;

            if (rewards > BigInt(0)) {
              finalRewards = rewards.toString();
              successfulAddressType = type;
              break;
            }
          } catch (error: any) {
            logWarn(
              `${chainName}: Failed to fetch rewards for ${operatorAddress} using ${type} address ${address}: ${error.message}`,
            );
          }
        }

        nodesRewards.push({
          address: operatorAddress,
          rewards: finalRewards,
        });

        if (successfulAddressType && finalRewards !== '0') {
          if (successfulAddressType === 'coinbase') {
            rewardsViaCoinbase++;
            logInfo(
              `${chainName}: Node ${operatorAddress} has rewards ${finalRewards} via coinbase split address`,
            );
          } else if (successfulAddressType === 'operator') {
            rewardsViaOperatorAddress++;
            logInfo(`${chainName}: Node ${operatorAddress} has rewards ${finalRewards} via operator address`);
          }
        } else {
          nodesWithZeroRewards++;
        }
      } catch (error: any) {
        logError(`${chainName}: Error processing node ${node.operatorAddress}: ${error.message}`);
        nodesRewards.push({
          address: node.operatorAddress,
          rewards: '0',
        });
      }
    }

    logInfo(`${chainName}: Fetched rewards for ${nodesRewards.length} nodes`);
    logInfo(
      `${chainName}: Rewards distribution - Coinbase: ${rewardsViaCoinbase}, Operator address: ${rewardsViaOperatorAddress}, Zero rewards: ${nodesWithZeroRewards}`,
    );
    return nodesRewards;
  } catch (error: any) {
    logError(`Failed to fetch Aztec node rewards: ${error.message}`);
    return [];
  }
};

export default getNodeRewards;
