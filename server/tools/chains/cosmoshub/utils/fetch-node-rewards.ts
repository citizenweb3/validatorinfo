import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('fetch-node-rewards');

const fetchNodeRewards = async (chain: AddChainProps, address: string): Promise<string | null> => {
  const url = `/cosmos/distribution/v1beta1/validators/${address}/outstanding_rewards`;

  try {
    const response = await fetchChainData<{
      rewards: {
        rewards: { denom: string; amount: string }[];
      };
    }>(chain.name, 'rest', url);

    const found = response.rewards.rewards.find((r) => r.denom === chain.minimalDenom);

    return found ? found.amount : null;
  } catch (e) {
    logError(`Can't fetch rewards: ${chain.name}`, e);
    return null;
  }
};

export default fetchNodeRewards;
