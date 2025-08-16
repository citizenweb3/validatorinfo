import { GetStakingParamsFunction } from '@/server/tools/chains/chain-indexer';

const getStakingParams: GetStakingParamsFunction = async (chain) => {
  return {
    unbondingTime: 604800,
    maxValidators: null,
  };
};

export default getStakingParams;
