import logger from '@/logger';
import { AddChainProps, GetChainRewards } from '@/server/tools/chains/chain-indexer';
import fetchNodeRewards from '@/server/tools/chains/cosmoshub/utils/fetch-node-rewards';
import fetchChainData from '@/server/tools/get-chain-data';
import { NodeResult } from '@/server/types';

const { logError } = logger('cosmos-chain-rewards');

const getChainRewards: GetChainRewards = async (chain: AddChainProps) => {
  const validatorsUrl = `/cosmos/staking/v1beta1/validators?pagination.limit=10000&pagination.count_total=false`;

  let nodes: NodeResult[] = [];
  let chainRewards = BigInt(0);
  let atLeastOneRewardFetched = false;

  try {
    nodes = (await fetchChainData<{ validators: NodeResult[] }>(chain.name, 'rest', validatorsUrl)).validators;
  } catch (e) {
    logError(`Can't fetch nodes for chain ${chain.name}`, e);
    return null;
  }

  for (const node of nodes) {
    try {
      const rewards = await fetchNodeRewards(chain, node.operator_address);
      if (rewards !== null && rewards !== undefined) {
        chainRewards += BigInt(rewards);
        atLeastOneRewardFetched = true;
      }
    } catch (e) {
      logError(`Can't get rewards for node ${node.operator_address} in chain ${chain.name}`, e);
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
