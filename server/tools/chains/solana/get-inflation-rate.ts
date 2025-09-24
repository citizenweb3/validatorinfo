import logger from '@/logger';
import { GetInflationRate } from '@/server/tools/chains/chain-indexer';
import fetchSolanaData from '@/server/tools/chains/solana/utils/fetch-solana-data';

const { logError } = logger('solana-inflation-rate');

const getInflationRate: GetInflationRate = async (chain) => {
  try {
    const response = await fetchSolanaData<{ total: string }>('getInflationRate');
    return response.total ? Number(response.total) : null;
  } catch (e) {
    logError(`Error fetching inflation rate for ${chain.name}`, e);
    return null;
  }
};

export default getInflationRate;
