import logger from '@/logger';
import { GetMainParamsFunction, MainParams } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

interface StakingParams {
  params: {
    unbonding_time: string;
    max_validators: number;
  };
}

const { logInfo, logError } = logger('get-main-params');

const getMainParams: GetMainParamsFunction = async (chain) => {
  const result: MainParams = {
    unbondingTime: null,
  };

  const restEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url;

  if (restEndpoint) {
    try {
      const unbondingTimeResult = await fetchData<StakingParams>(`${restEndpoint}/cosmos/staking/v1beta1/params`);
      if (unbondingTimeResult?.params?.unbonding_time) {
        result.unbondingTime = parseInt(unbondingTimeResult.params.unbonding_time);
        logInfo(`Unbonding time for ${chain.prettyName}: ${result.unbondingTime}`);
      }
    } catch (e) {
      logError(`Error fetching unbonding time for ${chain.prettyName}`, e);
    }
  }

  return result;
};

export default getMainParams;
