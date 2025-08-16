import logger from '@/logger';
import { GetInflationRate } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('cosmos-inflation-rate');

const getInflationRate: GetInflationRate = async (chain) => {
  try {
    const response = await fetchChainData<{ inflation: string }>(chain.name, 'rest', `/cosmos/mint/v1beta1/inflation`);
    if (response.inflation !== undefined && response.inflation !== null) {
      return Number(response.inflation);
    } else {
      return null;
    }
  } catch (e) {
    logError(`${chain.name} Can't fetch inflation rate: `, e);
    return null;
  }
};

export default getInflationRate;
