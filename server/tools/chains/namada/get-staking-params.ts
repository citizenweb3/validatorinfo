import logger from '@/logger';
import { GetStakingParamsFunction, StakingParams } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

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

  const indexerEndpoint = chain.nodes.find((node) => node.type === 'indexer')?.url;

  if (indexerEndpoint) {
    try {
      const url = `${indexerEndpoint}/api/v1/chain/parameters`;
      const unbondingTimeResult = await fetchData<ChainStakingParams>(url);

      const unbondingEpochs = Number(unbondingTimeResult.unbondingLength);
      const epochDurationSeconds = Number(unbondingTimeResult.minDuration);
      result.unbondingTime = unbondingEpochs * epochDurationSeconds;

      logInfo(`Staking params for ${chain.name}: ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      logError(`Error fetching staking params for ${chain.name}`, e);
    }
  }

  return result;
};

export default getStakingParams;
