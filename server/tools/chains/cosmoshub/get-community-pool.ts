import logger from '@/logger';
import fetchChainData from '@/server/tools/get-chain-data';
import { GetCommPoolFunction } from '@/server/tools/chains/chain-indexer';

const { logError } = logger('cosmos-comm-pool');

const getCommunityPool: GetCommPoolFunction = async (chain) => {
  try {
    const response = (await fetchChainData<{ pool: { denom: string; amount: string; }[] }>(
      chain.name,
      'rest',
      `/cosmos/distribution/v1beta1/community_pool`,
    )).pool;

    const communityPool = response.find(
      (pool) => pool.denom === chain.minimalDenom);

    return communityPool ? communityPool.amount : null;


  } catch (e) {
    logError(`${chain.name} Can't fetch community pool: `, e);
    return null;
  }
};

export default getCommunityPool;
