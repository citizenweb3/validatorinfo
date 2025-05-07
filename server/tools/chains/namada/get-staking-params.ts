import logger from '@/logger';
import { GetStakingParamsFunction, StakingParams } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

interface ChainStakingParams {
  unbondingLength: string;
  pipelineLength: string;
  epochsPerYear: string;
  apr: string;
  nativeTokenAddress: string;
  chainId: string;
  genesisTime: string;
  minDuration: string;
  minNumOfBlocks: string;
  maxBlockTime: string;
  epochSwitchBlocksDelay: string;
  cubicSlashingWindowLength: string;
  duplicateVoteMinSlashRate: string;
  lightClientAttackMinSlashRate: string;
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
      'indexer',
      `/api/v1/chain/parameters`,
    );

    const unbondingEpochs = Number(unbondingTimeResult.unbondingLength);
    const epochDurationSeconds = Number(unbondingTimeResult.minDuration);
    result.unbondingTime = unbondingEpochs * epochDurationSeconds;

    logInfo(`Staking params for ${chain.name}: ${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    logError(`Error fetching staking params for ${chain.name}`, e);
  }

  return result;
};

export default getStakingParams;
