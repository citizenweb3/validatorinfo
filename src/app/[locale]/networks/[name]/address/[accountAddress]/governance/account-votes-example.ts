import type { AccountVotingHistoryReady } from '@/services/account-governance-service';

export const accountVotesExample: AccountVotingHistoryReady = {
  status: 'ready',
  rows: [
    {
      proposalId: '917',
      proposalTitle: 'Community pool funding proposal',
      option: 'YES',
      weight: '1.000000000000000000',
      height: '22150412',
      txHash: 'MOCK_GOVERNANCE_TX_917',
      isClosed: true,
      impactBasisPoints: '5',
      impactUnavailableReason: null,
    },
    {
      proposalId: '916',
      proposalTitle: 'Network software upgrade',
      option: 'ABSTAIN',
      weight: '0.600000000000000000',
      height: '22119207',
      txHash: 'MOCK_GOVERNANCE_TX_916',
      isClosed: true,
      impactBasisPoints: '3',
      impactUnavailableReason: null,
    },
    {
      proposalId: '915',
      proposalTitle: 'Parameter change proposal',
      option: 'NO',
      weight: '1.000000000000000000',
      height: '22088410',
      txHash: 'MOCK_GOVERNANCE_TX_915',
      isClosed: false,
      impactBasisPoints: null,
      impactUnavailableReason: 'voting-in-progress',
    },
  ],
  truncated: false,
  totalVotes: '3',
  totalClosedProposals: 24,
};
