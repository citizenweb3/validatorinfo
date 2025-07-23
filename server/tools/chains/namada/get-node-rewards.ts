import logger from '@/logger';
import { AddChainProps, GetNodeRewards, NodesRewards } from '@/server/tools/chains/chain-indexer';
import { NamadaNode } from '@/server/tools/chains/namada/get-nodes';
import fetchNamadaNodeRewards from '@/server/tools/chains/namada/utils/fetch-namada-node-rewards';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('namada-node-rewards');

const getNodeRewards: GetNodeRewards = async (chain: AddChainProps) => {
  let nodesRewards: NodesRewards[] = [];
  let nodes: NamadaNode[] = [];

  try {
    nodes = await fetchChainData<NamadaNode[]>(chain.name, 'indexer', '/api/v1/pos/validator/all');
  } catch (e) {
    logError(`Can't fetch nodes for chain ${chain.name}`, e);
    return nodesRewards;
  }

  if (!nodes || nodes.length === 0) {
    logError(`Can't fetch nodes for chain ${chain.name}`);
    return nodesRewards;
  }

  for (const node of nodes) {
    try {
      const rewards = await fetchNamadaNodeRewards(chain, node.address);
      if (rewards !== undefined && rewards !== null) {
        nodesRewards.push({
          address: node.address,
          rewards: rewards,
        });
      }
    } catch (e) {
      logError(`Can't fetch rewards for node ${node.address}`, e);
      continue;
    }
  }
  return nodesRewards;
};

export default getNodeRewards;
