import logger from '@/logger';
import { GetAprFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('namada-apr');

const getApr: GetAprFunction = async (chain) => {
  try {
    const response = await fetchChainData<{ apr: string }>(chain.name, 'indexer', `/api/v1/chain/parameters`);
    return parseFloat(response.apr);
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
    return 0;
  }
};

export default getApr;
