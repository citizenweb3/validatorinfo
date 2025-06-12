import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-proposal-params');

const updateProposalParams = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        return null;
      }
      if (dbChain.hasValidators) {
        logInfo(`${chainName} updating`);
        const params = await chainMethods.getProposalParams(chainParams);

        await db.chain.update({
          where: { id: dbChain.id },
          data: {
            params: {
              update: {
                votingPeriod: params.votingPeriod ?? null,
                proposalCreationCost: params.creationCost ?? null,
                votingParticipationRate: params.participationRate ?? null,
                quorumThreshold: params.quorumThreshold ?? null,
              },
            },
          },
        });

      } else {
        logInfo(`${chainName} has no validators`);
      }
    } catch (e) {
      logError(`'Can't fetch proposal params for chain ${chainParams.name}: ${e}`);
    }
  }
};

export default updateProposalParams;
