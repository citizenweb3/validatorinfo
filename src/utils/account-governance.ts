import { normalizeUnsignedDecimal, normalizeUnsignedInteger } from '@/utils/decimal-string';

export const ACCOUNT_GOV_VOTE_OPTIONS = ['YES', 'NO', 'ABSTAIN', 'VETO', 'UNSPECIFIED'] as const;

export type AccountGovVoteOption = (typeof ACCOUNT_GOV_VOTE_OPTIONS)[number];

export type AccountGovVote = {
  proposal_id: string;
  option: AccountGovVoteOption;
  weight: string | null;
  height: string;
  tx_hash: string;
};

export type AccountGovVotesCursor = {
  next_before_proposal_id: string;
};

export type AccountGovVotesPage = {
  data: AccountGovVote[];
  cursor: AccountGovVotesCursor | null;
  has_more: boolean;
  total: string;
};

export const CLOSED_GOVERNANCE_PROPOSAL_STATUSES = [
  'PROPOSAL_STATUS_PASSED',
  'PROPOSAL_STATUS_REJECTED',
  'PROPOSAL_STATUS_FAILED',
] as const;

export type ClosedGovernanceProposalStatus = (typeof CLOSED_GOVERNANCE_PROPOSAL_STATUSES)[number];

export type FinalTally = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
  veto: bigint;
  total: bigint;
};

export type GovernanceChartRow = {
  proposalId: string;
  option: AccountGovVoteOption;
  isClosed: boolean;
};

export type GovernanceCharts = {
  options: Record<'YES' | 'NO' | 'ABSTAIN' | 'VETO', number>;
  participation: {
    voted: number;
    notVoted: number;
    totalClosedProposals: number;
  };
};

const parseTallyRecord = (value: unknown): Record<string, unknown> | null => {
  let parsed = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return parsed as Record<string, unknown>;
};

const parseTallyInteger = (value: unknown): bigint | null => {
  if (typeof value !== 'string') return null;

  try {
    return BigInt(normalizeUnsignedInteger(value));
  } catch {
    return null;
  }
};

export const parseFinalTally = (value: unknown): FinalTally | null => {
  const tally = parseTallyRecord(value);
  if (!tally) return null;

  const yes = parseTallyInteger(tally.yes_count);
  const no = parseTallyInteger(tally.no_count);
  const abstain = parseTallyInteger(tally.abstain_count);
  const veto = tally.no_with_veto_count === undefined ? BigInt(0) : parseTallyInteger(tally.no_with_veto_count);

  if (yes === null || no === null || abstain === null || veto === null) return null;
  return { yes, no, abstain, veto, total: yes + no + abstain + veto };
};

export const calculateImpactBasisPoints = (stake: string, totalVotedPower: bigint): bigint | null => {
  try {
    const normalizedStake = BigInt(normalizeUnsignedInteger(stake));
    if (normalizedStake === BigInt(0) || totalVotedPower === BigInt(0)) return null;
    if (normalizedStake > totalVotedPower) return null;
    return (normalizedStake * BigInt(10_000)) / totalVotedPower;
  } catch {
    return null;
  }
};

export const formatBasisPoints = (basisPoints: bigint): string => {
  const whole = basisPoints / BigInt(100);
  const fraction = String(basisPoints % BigInt(100)).padStart(2, '0');
  return `${whole}.${fraction}%`;
};

export const isWeightedGovernanceVote = (weight: string | null): boolean => {
  if (!weight) return false;

  try {
    return normalizeUnsignedDecimal(weight) !== '1';
  } catch {
    return false;
  }
};

export const isClosedGovernanceProposalStatus = (status: string): status is ClosedGovernanceProposalStatus =>
  CLOSED_GOVERNANCE_PROPOSAL_STATUSES.some((closedStatus) => closedStatus === status);

export const deriveGovernanceCharts = (
  rows: readonly GovernanceChartRow[],
  totalClosedProposals: number,
): GovernanceCharts => {
  const options: GovernanceCharts['options'] = { YES: 0, NO: 0, ABSTAIN: 0, VETO: 0 };
  const seenProposals = new Set<string>();
  const votedClosedProposals = new Set<string>();

  for (const row of rows) {
    if (seenProposals.has(row.proposalId)) continue;
    seenProposals.add(row.proposalId);

    if (row.option !== 'UNSPECIFIED') options[row.option] += 1;
    if (row.isClosed) votedClosedProposals.add(row.proposalId);
  }

  const safeClosedTotal = Math.max(0, totalClosedProposals);
  const voted = Math.min(votedClosedProposals.size, safeClosedTotal);
  return {
    options,
    participation: {
      voted,
      notVoted: Math.max(0, safeClosedTotal - voted),
      totalClosedProposals: safeClosedTotal,
    },
  };
};
