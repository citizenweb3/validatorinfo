import logger from '@/logger';
import { GetAprFunction } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

const { logError } = logger('nomic-apr');

export const getApr: GetAprFunction = async (chain) => {
  try {
    const lcdEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url;
    if (!lcdEndpoint) {
      logError(`api node for ${chain.name} chain not found`);
      return 0;
    }

    const response = await fetchData<{ result: string }>(`${lcdEndpoint}/minting/inflation`);
    return parseFloat(response.result);
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
    return 0;
  }
};

export default getApr;
