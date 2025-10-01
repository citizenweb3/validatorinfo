import logger from '@/logger';
import { GetCommPoolFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';
import { bigIntPow } from '@/server/utils/bigint-pow';


const { logError } = logger('bostrom-comm-pool');

const getCommunityPool: GetCommPoolFunction = async (chain) => {
  try {
    const response = (
      await fetchChainData<{ pool: { denom: string; amount: string }[] }>(
        chain.name,
        'rest',
        `/cosmos/distribution/v1beta1/community_pool`,
      )
    ).pool;

    const communityPool = response.find(
        (pool) => pool.denom.toLowerCase() === chain.denom.toLowerCase());

    return communityPool
      ? String(BigInt(String(communityPool.amount).split('.')[0]) * bigIntPow(BigInt(10), BigInt(chain.coinDecimals)))
      : null;

  } catch (e) {
    logError(`${chain.name} Can't fetch community pool: `, e);
    return null;
  }
};

export default getCommunityPool;
