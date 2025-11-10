import logger from '@/logger';
import { AddChainProps, GetNodeCommissions, NodesCommissions } from '@/server/tools/chains/chain-indexer';
import fetchCosmosNodeCommissions from '@/server/tools/chains/cosmoshub/utils/fetch-cosmos-node-commissions';
import fetchChainData from '@/server/tools/get-chain-data';
import { NodeResult } from '@/server/types';

const { logError } = logger('cosmos-node-commissions');

const getNodeCommissions: GetNodeCommissions = async (chain: AddChainProps) => {
  const validatorsUrl = `/cosmos/staking/v1beta1/validators?pagination.limit=10000&pagination.count_total=false`;

  let nodesCommissions: NodesCommissions[] = [];
  let nodes: NodeResult[] = [];

  try {
    nodes = (await fetchChainData<{ validators: NodeResult[] }>(chain.name, 'rest', validatorsUrl)).validators;
  } catch (e) {
    logError(`Can't fetch nodes for chain ${chain.name}`, e);
    return nodesCommissions;
  }

  for (const node of nodes) {
    try {
      const commission = await fetchCosmosNodeCommissions(chain, node.operator_address);
      if (commission !== null && commission !== undefined) {
        nodesCommissions.push({
          address: node.operator_address,
          commission: commission,
        });
      }
    } catch (e) {
      if (e instanceof Error && e.message && e.message.includes('No working endpoints available')) {
        logError(`No working endpoints for chain ${chain.name}, terminating nodes rewards calculation`, e);
        return [];
      }
      logError(`Can't fetch rewards for node ${node.operator_address}`, e);
      continue;
    }
  }

  return nodesCommissions;
};

export default getNodeCommissions;
