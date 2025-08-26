import logger from '@/logger';
import { GetCommPoolFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('nym-comm-pool');

const getCommunityPool: GetCommPoolFunction = async (chain) => {
  try {
    const response = (
      await fetchChainData<{ pool: { denom: string; amount: string }[] }>(
        chain.name,
        'rest',
        `/cosmos/protocolpool/v1/community_pool`,
      )
    ).pool;

    const communityPool = response.find(
        (pool) => pool.denom.toLowerCase() === chain.minimalDenom.toLowerCase());

    return communityPool ? communityPool.amount : null;
  } catch (e) {
    logError(`${chain.name} Can't fetch community pool for ${chain.name}: `, e);
    return null;
  }
};

export default getCommunityPool;
