import {
  AztecChainName,
  getL1,
  isAztecChainName,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import {
  getGovernanceConfig,
  GovernanceConfiguration,
} from '@/server/tools/chains/aztec/utils/get-governance-config';
import { getTotalVotingPower } from '@/server/tools/chains/aztec/utils/get-governance-power';
import { getTotalSupply } from '@/server/tools/chains/aztec/utils/get-total-supply';
import { getChainParams } from '@/server/tools/chains/params';
import formatCash from '@/utils/format-cash';
import formatDurationSeconds from '@/utils/format-duration-seconds';
import formatWeiPercentage from '@/utils/format-wei-percentage';

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

const getL1RpcUrls = (chainName: AztecChainName): string[] => {
  const l1ChainName = getL1[chainName];
  if (!l1ChainName) return [];

  const l1Chain = getChainParams(l1ChainName);
  return l1Chain.nodes?.filter((n) => n.type === 'rpc').map((n) => n.url) ?? [];
};

const formatTokenAmount = (wei: bigint): string => {
  const amount = Number(wei) / 1e18;
  return formatCash(amount, 2).replace(/\s/g, '');
};

const getGovernanceConfigDisplay = async (
  chainName: string,
): Promise<GovernanceConfigDisplay | null> => {
  if (!isAztecChainName(chainName)) return null;

  const config = await getGovernanceConfig(chainName);
  if (!config) return null;

  return {
    votingDelay: formatDurationSeconds(config.votingDelay),
    votingDuration: formatDurationSeconds(config.votingDuration),
    executionDelay: formatDurationSeconds(config.executionDelay),
    gracePeriod: formatDurationSeconds(config.gracePeriod),
    quorum: formatWeiPercentage(config.quorum),
    requiredYeaMargin: formatWeiPercentage(config.requiredYeaMargin),
    minimumVotes: formatTokenAmount(config.minimumVotes),
    lockAmount: formatTokenAmount(config.proposeConfig.lockAmount),
    lockDelay: formatDurationSeconds(config.proposeConfig.lockDelay),
  };
};

const getVotingPowerDisplay = async (
  chainName: string,
): Promise<VotingPowerDisplay | null> => {
  if (!isAztecChainName(chainName)) return null;

  const l1RpcUrls = getL1RpcUrls(chainName);
  if (l1RpcUrls.length === 0) return null;

  const [totalPower, totalSupply] = await Promise.all([
    getTotalVotingPower(chainName),
    getTotalSupply(l1RpcUrls, chainName).catch(() => null),
  ]);

  if (!totalPower) return null;

  let percentOfSupply = 0;
  if (totalSupply && totalSupply > BigInt(0)) {
    percentOfSupply = (Number(totalPower) / Number(totalSupply)) * 100;
  }

  return {
    totalPower: formatTokenAmount(totalPower),
    percentOfSupply,
  };
};

const getRawGovernanceConfig = async (
  chainName: string,
): Promise<GovernanceConfiguration | null> => {
  if (!isAztecChainName(chainName)) return null;
  return getGovernanceConfig(chainName);
};

const getRawTotalVotingPower = async (chainName: string): Promise<bigint | null> => {
  if (!isAztecChainName(chainName)) return null;
  return getTotalVotingPower(chainName);
};

const aztecGovernanceService = {
  getGovernanceConfigDisplay,
  getVotingPowerDisplay,
  getRawGovernanceConfig,
  getRawTotalVotingPower,
};

export default aztecGovernanceService;
