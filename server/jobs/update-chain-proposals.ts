import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

import { $Enums } from '.prisma/client';

const { logError, logInfo, logDebug } = logger('update-proposals');

const updateChainProposals = async (chainNames: string[]) => {
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
      logInfo(`${chainName} updating`);
      const proposals = await chainMethods.getProposals(chainParams);
      const dbProposals = await db.proposal.findMany({
        where: { chainId: dbChain.id },
      });
      logInfo(`${chainName} proposalsCount: ${proposals.proposals.length}/${dbProposals.length}`);

      let proposalsLive = 0;
      let proposalsPassed = 0;
      let proposalsTotal = 0;

      for (const proposal of proposals.proposals) {
        proposalsTotal++;

        if (proposal.status === $Enums.ProposalStatus.PROPOSAL_STATUS_PASSED) {
          proposalsPassed++;
        }
        if (
          proposal.status === $Enums.ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD ||
          proposal.status === $Enums.ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD
        ) {
          proposalsLive++;
        }

        const dbProposal = dbProposals.find((p) => p.proposalId === proposal.proposalId);
        if (
          dbProposal?.status === $Enums.ProposalStatus.PROPOSAL_STATUS_PASSED ||
          dbProposal?.status === $Enums.ProposalStatus.PROPOSAL_STATUS_REJECTED ||
          dbProposal?.status === $Enums.ProposalStatus.PROPOSAL_STATUS_FAILED
        ) {
          logDebug(
            `Proposal ${proposal.proposalId} ${proposal.title} already processed with status ${dbProposal.status}`,
          );
          continue;
        }
        await db.proposal.upsert({
          where: {
            chainId_proposalId: {
              chainId: dbChain.id,
              proposalId: proposal.proposalId,
            },
          },
          update: {
            status: proposal.status,
            votingStartTime: proposal.votingStartTime,
            votingEndTime: proposal.votingEndTime,
            tallyResult: proposal.tallyResult,
            finalTallyResult: proposal.finalTallyResult,
          },
          create: {
            chainId: dbChain.id,
            proposalId: proposal.proposalId,
            status: proposal.status,
            submitTime: proposal.submitTime,
            depositEndTime: proposal.depositEndTime,
            votingStartTime: proposal.votingStartTime,
            votingEndTime: proposal.votingEndTime,
            tallyResult: proposal.tallyResult,
            finalTallyResult: proposal.finalTallyResult,
            content: proposal.content,
            title: proposal.title,
            description: proposal.description,
            type: proposal.type,
          },
        });

        if (!dbProposal) {
          logInfo(`Proposal ${proposal.proposalId} ${proposal.title} created successfully`);
        }
      }

      await db.chain.update({
        where: { id: dbChain.id },
        data: {
          proposalsLive,
          proposalsPassed,
          proposalsTotal,
        },
      });
    } catch (e) {
      logError("Can't fetch proposal's: ", e);
    }
  }
};

export default updateChainProposals;
