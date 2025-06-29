import { GetStakingParamsFunction } from '@/server/tools/chains/chain-indexer';

const getStakingParams: GetStakingParamsFunction = async (chain) => {
  return {
    unbondingTime: null,
    maxValidators: null,
  };
};

export default getStakingParams;