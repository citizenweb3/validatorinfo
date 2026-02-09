import db from '@/db';
import logger from '@/logger';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';

const { logDebug, logWarn } = logger('aztec-governance-db');

export interface StoredGovernanceConfig {
  proposeConfig: {
    lockDelay: string;
    lockAmount: string;
  };
  votingDelay: string;
  votingDuration: string;
  executionDelay: string;
  gracePeriod: string;
  quorum: string;
  requiredYeaMargin: string;
  minimumVotes: string;
}

export interface AztecGovernanceData {
  governanceConfig: StoredGovernanceConfig | null;
  committeeSize: number | null;
  activeAttesterCount: number | null;
  totalVotingPower: string | null;
  totalSupply: string | null;
  updatedAt: string;
}

export const getAztecGovernanceDataFromDb = async (
  chainName: string,
): Promise<AztecGovernanceData | null> => {
  if (!isAztecChainName(chainName)) {
    logWarn(`${chainName} is not an Aztec chain`);
    return null;
  }

  try {
    const chainParams = getChainParams(chainName);
    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
      include: { params: true },
    });

    if (!dbChain?.params?.aztecGovernanceConfigAdditional) {
      logDebug(`${chainName}: No governance data in database`);
      return null;
    }

    const data = dbChain.params.aztecGovernanceConfigAdditional as unknown as AztecGovernanceData;
    logDebug(`${chainName}: Loaded governance data from DB (updated: ${data.updatedAt})`);
    return data;
  } catch (e: any) {
    logWarn(`${chainName}: Failed to read governance data from DB: ${e.message}`);
    return null;
  }
};
