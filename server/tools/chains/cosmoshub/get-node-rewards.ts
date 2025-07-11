import logger from '@/logger';
import { AddChainProps, GetNodeRewards, NodesRewards } from '@/server/tools/chains/chain-indexer';
import fetchCosmosNodeRewards from '@/server/tools/chains/cosmoshub/utils/fetch-cosmos-node-rewards';
import fetchChainData from '@/server/tools/get-chain-data';
import { NodeResult } from '@/server/types';

const { logError } = logger('cosmos-node-rewards');

const getNodeRewards: GetNodeRewards = async (chain: AddChainProps) => {
  const validatorsUrl = `/cosmos/staking/v1beta1/validators?pagination.limit=10000&pagination.count_total=false`;

  let nodesRewards: NodesRewards[] = [];
  let nodes: NodeResult[] = [];

  try {
    nodes = (await fetchChainData<{ validators: NodeResult[] }>(chain.name, 'rest', validatorsUrl)).validators;
  } catch (e) {
    logError(`Can't fetch nodes for chain ${chain.name}`, e);
    return nodesRewards;
  }

  for (const node of nodes) {
    try {
      const rewards = await fetchCosmosNodeRewards(chain, node.operator_address);
      if (rewards !== null && rewards !== undefined) {
        nodesRewards.push({
          address: node.operator_address,
          rewards: rewards,
        });
      }
    } catch (err) {
      logError(`Can't fetch rewards for node ${node.operator_address}`, err);
      continue;
    }
  }

  return nodesRewards;
};

export default getNodeRewards;
