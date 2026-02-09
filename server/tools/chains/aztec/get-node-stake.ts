import { getAddress } from 'viem';
import db from '@/db';
import logger from '@/logger';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { fetchNodeStake } from '@/server/tools/chains/aztec/utils/fetch-node-stake';
import { fetchDelegatedStakes } from '@/server/tools/chains/aztec/utils/fetch-delegated-stake';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo, logWarn } = logger('aztec-nodes-stake');

export interface NodeStake {
  operatorAddress: `0x${string}`;
  tokens: string;
  delegatorShares: string;
}

export const fetchStakesForNodes = async (
  nodes: Array<{ operatorAddress: string }>,
  l1RpcUrls: string[],
  chainName: 'aztec' | 'aztec-testnet',
  chainId: number,
  batchNumber?: number,
): Promise<NodeStake[]> => {
  const batchPrefix = batchNumber !== undefined ? `Batch ${batchNumber}: ` : '';
  logInfo(`${batchPrefix}Starting parallel stake fetch for ${nodes.length} nodes`);

  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 1000;

  const checksummedNodes = nodes.map((node) => ({
    operatorAddress: getAddress(node.operatorAddress),
  }));

  logInfo(`${batchPrefix}Fetching delegated stakes for ${checksummedNodes.length} attesters...`);
  let delegatedStakesMap = new Map<string, any>();

  try {
    delegatedStakesMap = await fetchDelegatedStakes(
      checksummedNodes.map((n) => n.operatorAddress),
      chainId,
    );
    logInfo(`${batchPrefix}Fetched delegated stakes for ${delegatedStakesMap.size} attesters`);
  } catch (delegatedError: any) {
    logError(
      `${batchPrefix}Failed to fetch delegated stakes from DB: ${delegatedError.message}. Will only fetch tokens.`,
    );
  }

  const stakePromises = checksummedNodes.map(async (node) => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const tokens = await fetchNodeStake(node.operatorAddress, l1RpcUrls, chainName);

        const delegatedStake = delegatedStakesMap.get(node.operatorAddress);
        const delegatorShares = delegatedStake ? delegatedStake.delegatedStake : '0';

        if (tokens !== BigInt(0) || delegatorShares !== '0') {
          return {
            operatorAddress: node.operatorAddress,
            tokens: String(tokens),
            delegatorShares: delegatorShares,
          };
        }

        return {
          operatorAddress: node.operatorAddress,
          tokens: '0',
          delegatorShares: '0',
        };
      } catch (e: any) {
        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          logWarn(
            `${batchPrefix}Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${node.operatorAddress}: ${e.message}. Retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          const delegatedStake = delegatedStakesMap.get(node.operatorAddress);
          if (delegatedStake && delegatedStake.delegatedStake !== '0') {
            logWarn(
              `${batchPrefix}Failed to fetch tokens for ${node.operatorAddress}, but has delegated stake: ${delegatedStake.delegatedStake}`,
            );
            return {
              operatorAddress: node.operatorAddress,
              tokens: '0',
              delegatorShares: delegatedStake.delegatedStake,
            };
          }
          logError(
            `${batchPrefix}All ${MAX_RETRIES} attempts failed for ${node.operatorAddress}: ${e.message}`,
          );
        }
      }
    }

    return null;
  });

  const results = await Promise.all(stakePromises);

  const nodesStake: NodeStake[] = results.filter((r): r is NodeStake => r !== null);

  const successRate = ((nodesStake.length / nodes.length) * 100).toFixed(1);
  logInfo(`${batchPrefix}Fetched ${nodesStake.length}/${nodes.length} stakes (${successRate}% success rate)`);

  if (nodesStake.length < nodes.length * 0.8) {
    logError(
      `${batchPrefix}WARNING: Less than 80% success rate! Only ${nodesStake.length}/${nodes.length} stakes fetched`,
    );
  }

  return nodesStake;
};

const getNodesForStakeFetch = async (chain: AddChainProps, dbChainId: number) => {
  try {
    const chainName = chain.name as 'aztec' | 'aztec-testnet';

    const l1Chain = getChainParams(getL1[chainName]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      throw new Error('No L1 RPC URLs found - cannot fetch providers');
    }

    logInfo(`Fetching nodes for chainId ${dbChainId}`);

    const nodes = await db.node.findMany({
      where: { chainId: dbChainId },
      select: {
        id: true,
        operatorAddress: true,
      },
    });

    logInfo(`Found ${nodes.length} nodes for chainId ${dbChainId}`);

    if (nodes.length === 0) {
      logWarn(`No nodes found for chainId ${dbChainId}`);
      return { nodes: [], l1RpcUrls, chainName, chainId: dbChainId };
    }

    return { nodes, l1RpcUrls, chainName, chainId: dbChainId };
  } catch (e: any) {
    logError(`Failed to fetch nodes for stake update: ${e.message}`);
    return null;
  }
};

export default getNodesForStakeFetch;
