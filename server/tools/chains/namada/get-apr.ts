import logger from '@/logger';
import { GetAprFunction } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

const { logError } = logger('namada-apr');

const getApr: GetAprFunction = async (chain) => {
  try {
    const indexerEndpoint = chain.nodes.find((node) => node.type === 'indexer')?.url;
    if (!indexerEndpoint) {
      logError(`Indexer node for ${chain.name} chain not found`);
      return 0;
    }

    const response = await fetchData<{ apr: string }>(`${indexerEndpoint}/api/v1/chain/parameters`);
    return parseFloat(response.apr);
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
    return 0;
  }
};

export default getApr;
