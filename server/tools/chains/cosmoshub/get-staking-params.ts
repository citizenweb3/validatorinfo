import logger from '@/logger';
import { GetStakingParamsFunction, StakingParams } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

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

  try {
    const unbondingTimeResult = await fetchChainData<ChainStakingParams>(
      chain.name,
      'rest',
      '/cosmos/staking/v1beta1/params',
    );
    if (unbondingTimeResult?.params?.unbonding_time) {
      result.unbondingTime = parseInt(unbondingTimeResult.params.unbonding_time);
      result.maxValidators = unbondingTimeResult.params.max_validators;
      logInfo(`Staking params for ${chain.name}: ${JSON.stringify(result)}`);
    }
    return result;
  } catch (e) {
    logError(`Error fetching staking params for ${chain.name}`, e);
  }

  return result;
};

export default getStakingParams;
