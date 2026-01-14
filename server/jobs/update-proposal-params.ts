import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';
import { Prisma } from '@prisma/client';

const { logError, logInfo } = logger('update-proposal-params');

const updateProposalParams = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: { params: true },
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
              upsert: {
                create: {
                  denom: chainParams.denom,
                  minimalDenom: chainParams.minimalDenom,
                  coinDecimals: chainParams.coinDecimals,
                  coinType: chainParams.coinType,
                  bech32Prefix: chainParams.bech32Prefix ?? '',
                  votingPeriod: params.votingPeriod ?? null,
                  proposalCreationCost: params.creationCost ?? null,
                  votingParticipationRate: params.participationRate ?? null,
                  quorumThreshold: params.quorumThreshold ?? null,
                  aztecGovernanceConfigAdditional: params.aztecGovernanceConfigAdditional
                    ? (params.aztecGovernanceConfigAdditional as Prisma.InputJsonValue)
                    : undefined,
                },
                update: {
                  votingPeriod: params.votingPeriod ?? null,
                  proposalCreationCost: params.creationCost ?? null,
                  votingParticipationRate: params.participationRate ?? null,
                  quorumThreshold: params.quorumThreshold ?? null,
                  aztecGovernanceConfigAdditional: params.aztecGovernanceConfigAdditional
                    ? (params.aztecGovernanceConfigAdditional as Prisma.InputJsonValue)
                    : undefined,
                },
              },
            },
          },
        });
        logInfo(`${chainName} proposal params updated successfully`);
      } else {
        logInfo(`${chainName} has no validators`);
      }
    } catch (e) {
      logError(`'Can't fetch proposal params for chain ${chainParams.name}: ${e}`);
    }
  }
};

export default updateProposalParams;
