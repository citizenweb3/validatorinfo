import logger from '@/logger';
import { DelegatorsAmount, GetDelegatorsAmount } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';
import { NodeResult } from '@/server/types';

const { logError } = logger('get-delegators-amount');

const getDelegatorsAmount: GetDelegatorsAmount = async (chain) => {
  const validatorsUrl = `/cosmos/staking/v1beta1/validators?pagination.limit=10000&pagination.count_total=false`;

  let delegatorsAmountList: DelegatorsAmount[] = [];

  try {
    const nodes = (await fetchChainData<{ validators: NodeResult[] }>(chain.name, 'rest', validatorsUrl)).validators;

    for (const node of nodes) {
      try {
        const delegators = await fetchChainData<{
          pagination: {
            next_key: string | null;
            total: string;
          };
        }>(
          chain.name,
          'rest',
          `/cosmos/staking/v1beta1/validators/${node.operator_address}/delegations?pagination.limit=1&pagination.count_total=true`,
        );

        const delegatorsAmount = delegators.pagination.total;
        delegatorsAmountList.push({
          address: node.operator_address,
          amount: Number(delegatorsAmount),
        });
      } catch (e) {
        logError(`Error with fetching delegators amount for node: ${node.operator_address}: ${e}`);
        continue;
      }
    }
    return delegatorsAmountList;
  } catch (e) {
    logError(`Can't fetch cosmos nodes: ${validatorsUrl} for chain: ${chain.name}`, e);
    return [];
  }
};

export default getDelegatorsAmount;
