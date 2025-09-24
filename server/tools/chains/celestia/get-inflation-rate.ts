import logger from '@/logger';
import { GetInflationRate } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('celestia-inflation-rate');

const getInflationRate: GetInflationRate = async (chain) => {
  try {
    const response = await fetchChainData<{ inflation_rate: string }>(chain.name, 'rest', `/cosmos/mint/v1beta1/inflation_rate`);
    if (response.inflation_rate !== undefined && response.inflation_rate !== null) {
      return Number(response.inflation_rate);
    } else {
      return null;
    }
  } catch (e) {
    logError(`${chain.name} Can't fetch inflation rate: `, e);
    return null;
  }
};

export default getInflationRate;
