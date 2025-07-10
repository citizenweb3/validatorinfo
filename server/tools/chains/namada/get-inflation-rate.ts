import logger from '@/logger';
import { GetInflationRate } from '@/server/tools/chains/chain-indexer';
import { getPosParams } from '@/server/tools/chains/namada/utils/get-pos-params';

const { logError } = logger('namada-inflation rate');

const getInflationRate: GetInflationRate = async (chain) => {
  try {
    const posParams = await getPosParams(chain.name);
    return Number(posParams.max_inflation_rate);
  } catch (e) {
    logError(`Error fetching inflation rate for ${chain.name}`, e);
    return null;
  }
};

export default getInflationRate;
