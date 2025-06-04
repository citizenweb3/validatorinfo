import logger from '@/logger';
import fetchChainData from '@/server/tools/get-chain-data';
import { GetWalletsAmount } from '@/server/tools/chains/chain-indexer';

const { logError } = logger('cosmos-wallets-amount');

const getWalletsAmount: GetWalletsAmount = async (chain) => {
  try {
    return await fetchChainData<{ pagination: { total: string } }>(
      chain.name,
      'rest',
      `/cosmos/auth/v1beta1/accounts?pagination.offset=0&pagination.limit=1&pagination.count_total=true`,
    ).then((data) => Number(data.pagination.total));
  } catch (e) {
    logError(`${chain.name} Can't fetch wallets amount: `, e);
    return null;
  }
};

export default getWalletsAmount;
