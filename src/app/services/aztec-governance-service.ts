import logger from '@/logger';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { GovernanceConfiguration } from '@/server/tools/chains/aztec/utils/get-governance-config';
import formatCash from '@/utils/format-cash';
import formatDurationSeconds from '@/utils/format-duration-seconds';
import formatWeiPercentage from '@/utils/format-wei-percentage';

import { getAztecGovernanceDataFromDb, StoredGovernanceConfig } from './aztec-governance-db';

const { logDebug } = logger('aztec-governance-service');

export interface GovernanceConfigDisplay {
  votingDelay: string;
  votingDuration: string;
  executionDelay: string;
  gracePeriod: string;
  quorum: string;
  requiredYeaMargin: string;
  minimumVotes: string;
  lockAmount: string;
  lockDelay: string;
}

export interface VotingPowerDisplay {
  totalPower: string;
  percentOfSupply: number;
}

const formatTokenAmount = (wei: bigint): string => {
  const amount = Number(wei) / 1e18;
  return formatCash(amount, 2).replace(/\s/g, '');
};

const formatStoredConfig = (config: StoredGovernanceConfig): GovernanceConfigDisplay => {
  return {
    votingDelay: formatDurationSeconds(BigInt(config.votingDelay)),
    votingDuration: formatDurationSeconds(BigInt(config.votingDuration)),
    executionDelay: formatDurationSeconds(BigInt(config.executionDelay)),
    gracePeriod: formatDurationSeconds(BigInt(config.gracePeriod)),
    quorum: formatWeiPercentage(BigInt(config.quorum)),
    requiredYeaMargin: formatWeiPercentage(BigInt(config.requiredYeaMargin)),
    minimumVotes: formatTokenAmount(BigInt(config.minimumVotes)),
    lockAmount: formatTokenAmount(BigInt(config.proposeConfig.lockAmount)),
    lockDelay: formatDurationSeconds(BigInt(config.proposeConfig.lockDelay)),
  };
};

const getGovernanceConfigDisplay = async (
  chainName: string,
): Promise<GovernanceConfigDisplay | null> => {
  if (!isAztecChainName(chainName)) return null;

  const dbData = await getAztecGovernanceDataFromDb(chainName);
  if (!dbData?.governanceConfig) {
    logDebug(`${chainName}: governanceConfig not available in DB`);
    return null;
  }

  logDebug(`${chainName}: governanceConfig from DB (updated: ${dbData.updatedAt})`);
  return formatStoredConfig(dbData.governanceConfig);
};

const getVotingPowerDisplay = async (
  chainName: string,
): Promise<VotingPowerDisplay | null> => {
  if (!isAztecChainName(chainName)) return null;

  const dbData = await getAztecGovernanceDataFromDb(chainName);
  if (!dbData?.totalVotingPower) {
    logDebug(`${chainName}: totalVotingPower not available in DB`);
    return null;
  }

  const totalPower = BigInt(dbData.totalVotingPower);
  let percentOfSupply = 0;

  if (dbData.totalSupply) {
    const totalSupply = BigInt(dbData.totalSupply);
    if (totalSupply > BigInt(0)) {
      percentOfSupply = (Number(totalPower) / Number(totalSupply)) * 100;
    }
  }

  logDebug(`${chainName}: votingPower from DB (updated: ${dbData.updatedAt})`);
  return {
    totalPower: formatTokenAmount(totalPower),
    percentOfSupply,
  };
};

const getRawGovernanceConfig = async (
  chainName: string,
): Promise<GovernanceConfiguration | null> => {
  if (!isAztecChainName(chainName)) return null;

  const dbData = await getAztecGovernanceDataFromDb(chainName);
  if (!dbData?.governanceConfig) {
    return null;
  }

  const config = dbData.governanceConfig;
  return {
    proposeConfig: {
      lockDelay: BigInt(config.proposeConfig.lockDelay),
      lockAmount: BigInt(config.proposeConfig.lockAmount),
    },
    votingDelay: BigInt(config.votingDelay),
    votingDuration: BigInt(config.votingDuration),
    executionDelay: BigInt(config.executionDelay),
    gracePeriod: BigInt(config.gracePeriod),
    quorum: BigInt(config.quorum),
    requiredYeaMargin: BigInt(config.requiredYeaMargin),
    minimumVotes: BigInt(config.minimumVotes),
  };
};

const getRawTotalVotingPower = async (chainName: string): Promise<bigint | null> => {
  if (!isAztecChainName(chainName)) return null;

  const dbData = await getAztecGovernanceDataFromDb(chainName);
  if (!dbData?.totalVotingPower) {
    return null;
  }

  return BigInt(dbData.totalVotingPower);
};

const aztecGovernanceService = {
  getGovernanceConfigDisplay,
  getVotingPowerDisplay,
  getRawGovernanceConfig,
  getRawTotalVotingPower,
};

export default aztecGovernanceService;
