import logger from '@/logger';
import { GetAprFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('nomic-apr');

export const getApr: GetAprFunction = async (chain) => {
  try {
    const response = await fetchChainData<{ result: string }>(chain.name, 'rest', `/minting/inflation`);
    return parseFloat(response.result);
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
    return 0;
  }
};

export default getApr;
