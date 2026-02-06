import db from '@/db';
import logger from '@/logger';
import { getGovernanceConfig } from '@/server/tools/chains/aztec/utils/get-governance-config';
import { getTotalVotingPower } from '@/server/tools/chains/aztec/utils/get-governance-power';
import { getTotalSupply } from '@/server/tools/chains/aztec/utils/get-total-supply';
import getActiveAttesterCount from '@/server/tools/chains/aztec/utils/get-active-attester-count';
import getCommitteeSize from '@/server/tools/chains/aztec/utils/get-committee-size';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('update-aztec-governance-data');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const updateAztecGovernanceData = async () => {
  logInfo('Starting Aztec governance data update');

  for (const chainName of AZTEC_CHAINS) {
    try {
      const chainParams = getChainParams(chainName);
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: { params: true },
      });

      if (!dbChain?.params) {
        logInfo(`Chain ${chainName} not found in database or has no params, skipping`);
        continue;
      }

      logInfo(`${chainName}: Fetching governance data from L1 contracts`);

      const [governanceConfig, committeeSize, activeAttesterCount, totalVotingPower, totalSupply] =
        await Promise.all([
          getGovernanceConfig(chainName).catch((e) => {
            logError(`${chainName}: Failed to fetch governanceConfig: ${e.message}`);
            return null;
          }),
          getCommitteeSize(chainName).catch((e) => {
            logError(`${chainName}: Failed to fetch committeeSize: ${e.message}`);
            return null;
          }),
          getActiveAttesterCount(chainName).catch((e) => {
            logError(`${chainName}: Failed to fetch activeAttesterCount: ${e.message}`);
            return null;
          }),
          getTotalVotingPower(chainName).catch((e) => {
            logError(`${chainName}: Failed to fetch totalVotingPower: ${e.message}`);
            return null;
          }),
          getTotalSupply(chainName).catch((e) => {
            logError(`${chainName}: Failed to fetch totalSupply: ${e.message}`);
            return null;
          }),
        ]);

      const data = {
        governanceConfig: governanceConfig
          ? {
              proposeConfig: {
                lockDelay: String(governanceConfig.proposeConfig.lockDelay),
                lockAmount: String(governanceConfig.proposeConfig.lockAmount),
              },
              votingDelay: String(governanceConfig.votingDelay),
              votingDuration: String(governanceConfig.votingDuration),
              executionDelay: String(governanceConfig.executionDelay),
              gracePeriod: String(governanceConfig.gracePeriod),
              quorum: String(governanceConfig.quorum),
              requiredYeaMargin: String(governanceConfig.requiredYeaMargin),
              minimumVotes: String(governanceConfig.minimumVotes),
            }
          : null,
        committeeSize: committeeSize !== null ? Number(committeeSize) : null,
        activeAttesterCount: activeAttesterCount !== null ? Number(activeAttesterCount) : null,
        totalVotingPower: totalVotingPower !== null ? String(totalVotingPower) : null,
        totalSupply: totalSupply !== null ? String(totalSupply) : null,
        updatedAt: new Date().toISOString(),
      };

      await db.chainParams.update({
        where: { id: dbChain.params.id },
        data: { aztecGovernanceConfigAdditional: data },
      });

      logInfo(`${chainName}: Successfully updated governance data`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec governance data update completed');
};

export default updateAztecGovernanceData;
