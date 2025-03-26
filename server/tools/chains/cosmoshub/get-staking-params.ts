import logger from '@/logger';
import { GetStakingParamsFunction, StakingParams } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

interface ChainStakingParams {
  params: {
    unbonding_time: string;
    max_validators: number;
  };
}

const { logInfo, logError } = logger('get-staking-params');

const getStakingParams: GetStakingParamsFunction = async (chain) => {
  const result: StakingParams = {
    unbondingTime: null,
    maxValidators: null,
  };

  const restEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url;

  if (restEndpoint) {
    try {
      const url = `${restEndpoint}/cosmos/staking/v1beta1/params`;
      const unbondingTimeResult = await fetchData<ChainStakingParams>(url);
      if (unbondingTimeResult?.params?.unbonding_time) {
        result.unbondingTime = parseInt(unbondingTimeResult.params.unbonding_time);
        result.maxValidators = unbondingTimeResult.params.max_validators;
        logInfo(`Staking params for ${chain.name}: ${JSON.stringify(result)}`);
      }
      return result;
    } catch (e) {
      logError(`Error fetching staking params for ${chain.name}`, e);
    }
  }

  return result;
};

export default getStakingParams;
