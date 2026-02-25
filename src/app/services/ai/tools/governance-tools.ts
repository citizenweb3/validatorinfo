import { tool } from 'ai';
import { z } from 'zod';
import logger from '@/logger';
import ProposalService from '@/services/proposal-service';

const { logError } = logger('ai-tools:governance');

export const governanceTools = {
  getProposals: tool({
    description:
      'Get governance proposals for a specific blockchain network. Returns proposal titles, statuses, and voting information. Use when user asks about governance or proposals.',
    inputSchema: z.object({
      chainName: z.string().describe('The chain name identifier, e.g. cosmoshub, polkadot, aztec'),
    }),
    execute: async ({ chainName }) => {
      try {
        const proposals = await ProposalService.getListByChainName(chainName);

        if (proposals.length === 0) {
          return { chainName, total: 0, proposals: [], message: 'No proposals found for this chain' };
        }

        // Sort by proposalId numerically descending to get the truly latest proposals
        const sorted = proposals
          .sort((a, b) => Number(b.proposalId) - Number(a.proposalId))
          .slice(0, 15);

        return {
          chainName,
          total: proposals.length,
          latestProposalId: sorted[0]?.proposalId ?? null,
          proposals: sorted.map((p) => ({
            proposalId: p.proposalId,
            title: p.title,
            status: p.status,
            type: p.type,
            submitTime: p.submitTime,
            votingStartTime: p.votingStartTime,
            votingEndTime: p.votingEndTime,
            yesVotes: p.finalTallyResult ? (p.finalTallyResult as Record<string, string>).yes : null,
            noVotes: p.finalTallyResult ? (p.finalTallyResult as Record<string, string>).no : null,
            abstainVotes: p.finalTallyResult ? (p.finalTallyResult as Record<string, string>).abstain : null,
            vetoVotes: p.finalTallyResult ? (p.finalTallyResult as Record<string, string>).no_with_veto : null,
          })),
        };
      } catch (error) {
        logError(`getProposals failed for "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get proposals for chain "${chainName}"` };
      }
    },
  }),

  getProposalDetails: tool({
    description: 'Get detailed information about a specific governance proposal by chain name and proposal ID.',
    inputSchema: z.object({
      chainName: z.string().describe('The chain name identifier, e.g. cosmoshub'),
      proposalId: z.string().describe('The proposal ID number as a string'),
    }),
    execute: async ({ chainName, proposalId }) => {
      try {
        const proposal = await ProposalService.getProposalByChainNameAndId(chainName, proposalId);

        if (!proposal) {
          return { error: `Proposal #${proposalId} not found on chain "${chainName}"` };
        }

        return {
          proposalId: proposal.proposalId,
          title: proposal.title,
          description: proposal.description?.slice(0, 1000) ?? null,
          status: proposal.status,
          type: proposal.type,
          submitTime: proposal.submitTime,
          depositEndTime: proposal.depositEndTime,
          votingStartTime: proposal.votingStartTime,
          votingEndTime: proposal.votingEndTime,
          finalTallyResult: proposal.finalTallyResult,
        };
      } catch (error) {
        logError(`getProposalDetails failed for #${proposalId} on "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get proposal #${proposalId} for chain "${chainName}"` };
      }
    },
  }),
};
