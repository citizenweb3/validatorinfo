import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('cosmos-fetch-node-rewards');

const fetchCosmosNodeRewards = async (chain: AddChainProps, address: string): Promise<string | null> => {
  const url = `/cosmos/distribution/v1beta1/validators/${address}/outstanding_rewards`;

  try {
    const restUrl = chain.nodes.find((n: any) => n.type === 'rest' && n.url.includes('citizenweb3'))?.url ?? null;
    const sleepTime = restUrl ? 1000 : 10000;

    const response = await fetchChainData<{
      rewards: {
        rewards: { denom: string; amount: string }[];
      };
    }>(chain.name, 'rest', url, sleepTime);

    const found = response.rewards.rewards.find((r) => r.denom === chain.minimalDenom);
    return found ? found.amount : null;
  } catch (e: any) {
    if (e instanceof Error && e.message && e.message.includes('No working endpoints available')) {
      throw e;
    }
    logError(`Can't fetch rewards: ${chain.name}`, e);
    return null;
  }
};

export default fetchCosmosNodeRewards;
