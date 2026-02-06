import logger from '@/logger';
import { GetProposalParams, ProposalParams } from '@/server/tools/chains/chain-indexer';
import { AztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getGovernanceConfig } from '@/server/tools/chains/aztec/utils/get-governance-config';
import { getTotalVotingPower } from '@/server/tools/chains/aztec/utils/get-governance-power';
import { getTotalSupply } from '@/server/tools/chains/aztec/utils/get-total-supply';

const { logInfo, logError } = logger('get-proposal-params-aztec');

const getProposalParams: GetProposalParams = async (chain) => {
  const result: ProposalParams = {
    creationCost: null,
    votingPeriod: null,
    participationRate: null,
    quorumThreshold: null,
    aztecGovernanceConfigAdditional: null,
  };

  try {
    const chainName = chain.name as AztecChainName;
    const config = await getGovernanceConfig(chainName);

    if (!config) {
      logError(`${chainName}: Failed to get governance config`);
      return result;
    }

    result.creationCost = Number(config.proposeConfig.lockAmount) / 10 ** Number(chain.coinDecimals);

    result.votingPeriod = config.votingDuration.toString();

    result.quorumThreshold = Number(config.quorum) / 10 ** Number(chain.coinDecimals);

    result.aztecGovernanceConfigAdditional = {
      votingDelay: config.votingDelay.toString(),
      executionDelay: config.executionDelay.toString(),
      gracePeriod: config.gracePeriod.toString(),
      requiredYeaMargin: Number(config.requiredYeaMargin) / 10 ** Number(chain.coinDecimals),
      minimumVotes: config.minimumVotes.toString(),
      lockDelay: config.proposeConfig.lockDelay.toString(),
    };

    try {
      const [totalPowerResult, totalSupplyResult] = await Promise.allSettled([
        getTotalVotingPower(chainName),
        getTotalSupply(chainName),
      ]);

      if (totalPowerResult.status === 'rejected') {
        logError(`${chainName}: Failed to fetch totalVotingPower: ${totalPowerResult.reason?.message}`);
      }
      if (totalSupplyResult.status === 'rejected') {
        logError(`${chainName}: Failed to fetch totalSupply: ${totalSupplyResult.reason?.message}`);
      }

      const totalPower = totalPowerResult.status === 'fulfilled' ? totalPowerResult.value : null;
      const totalSupply = totalSupplyResult.status === 'fulfilled' ? totalSupplyResult.value : null;

      if (totalPower && totalSupply && totalSupply > BigInt(0)) {
        result.participationRate = Number(totalPower) / Number(totalSupply);
      }
    } catch (e: any) {
      logError(`${chainName}: Failed to calculate participation rate: ${e.message}`);
    }

    logInfo(`${chainName}: Proposal params fetched successfully`);
  } catch (e: any) {
    logError(`Error fetching proposal params: ${e.message}`);
  }

  return result;
};

export default getProposalParams;
