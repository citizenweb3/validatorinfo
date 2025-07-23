import logger from '@/logger';
import { AddChainProps, GetChainRewards } from '@/server/tools/chains/chain-indexer';
import { NamadaNode } from '@/server/tools/chains/namada/get-nodes';
import fetchNamadaNodeRewards from '@/server/tools/chains/namada/utils/fetch-namada-node-rewards';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('namada-chain-rewards');

const getChainRewards: GetChainRewards = async (chain: AddChainProps) => {
  let nodes: NamadaNode[] = [];
  let chainRewards = BigInt(0);
  let atLeastOneRewardFetched = false;

  try {
    nodes = await fetchChainData<NamadaNode[]>(chain.name, 'indexer', '/api/v1/pos/validator/all');
  } catch (e) {
    logError(`Can't fetch nodes for chain ${chain.name}`, e);
    return null;
  }

  for (const node of nodes) {
    try {
      const rewards = await fetchNamadaNodeRewards(chain, node.address);
      if (rewards !== null && rewards !== undefined) {
        chainRewards += BigInt(rewards);
        atLeastOneRewardFetched = true;
      }
    } catch (e) {
      logError(`Can't get rewards for node ${node.address} in chain ${chain.name}`, e);
      continue;
    }
  }

  if (atLeastOneRewardFetched) {
    return String(chainRewards);
  } else {
    return null;
  }
};

export default getChainRewards;
