import db from '@/db';
import logger from '@/logger';
import { getAccountIndexerFactsClient } from '@/services/account-indexer-facts';
import { getChainLcdContext } from '@/services/chain-service';
import DelegatedStakeService from '@/services/delegated-stake-service';
import { CACHE_KEYS, CACHE_TTL, cacheGetOrFetch } from '@/services/redis-cache';
import {
  type AccountGovVoteOption,
  CLOSED_GOVERNANCE_PROPOSAL_STATUSES,
  calculateImpactBasisPoints,
  isClosedGovernanceProposalStatus,
  parseFinalTally,
} from '@/utils/account-governance';
import { normalizeBech32Address } from '@/utils/bech32-address';
import { isGovVotesChainSupported } from '@/utils/governance-supported-chains';

const { logError, logWarn } = logger('account-governance-service');

// The indexer API caps a page at 100 final votes; five pages cover any realistic account.
const DRAIN_PAGE_LIMIT = 100;
const MAX_DRAIN_PAGES = 5;

export type AccountVoteImpactUnavailableReason =
  | 'proposal-unavailable'
  | 'voting-in-progress'
  | 'tally-unavailable'
  | 'stake-unavailable';

export type AccountVoteRow = {
  proposalId: string;
  proposalTitle: string | null;
  option: AccountGovVoteOption;
  weight: string | null;
  height: string;
  txHash: string;
  isClosed: boolean;
  impactBasisPoints: string | null;
  impactUnavailableReason: AccountVoteImpactUnavailableReason | null;
};

export type AccountVotingHistoryReady = {
  status: 'ready';
  rows: AccountVoteRow[];
  totalVotes: string;
  totalClosedProposals: number;
  truncated: boolean;
};

export type AccountVotingHistoryResult = AccountVotingHistoryReady | { status: 'unsupported' } | { status: 'error' };

const loadVotingHistory = async (
  chainName: string,
  address: string,
  chainId: number,
  minimalDenom: string,
): Promise<AccountVotingHistoryReady> => {
  const client = getAccountIndexerFactsClient(chainName);
  if (!client) throw new Error(`account indexer client is unavailable for ${chainName}`);

  const votes: Awaited<ReturnType<typeof client.getGovVotes>>['data'] = [];
  let totalVotes = '0';
  let truncated = false;
  let beforeProposalId: string | undefined;
  for (let drained = 0; drained < MAX_DRAIN_PAGES; drained++) {
    const page = await client.getGovVotes(
      { voter: address, limit: DRAIN_PAGE_LIMIT, before_proposal_id: beforeProposalId },
      { cache: 'no-store', timeout: 30_000 },
    );
    votes.push(...page.data);
    totalVotes = page.total;
    if (!page.has_more || !page.cursor) break;
    beforeProposalId = page.cursor.next_before_proposal_id;
    if (drained === MAX_DRAIN_PAGES - 1) truncated = true;
  }
  const proposalIds = Array.from(new Set(votes.map((vote) => vote.proposal_id)));
  const heights = Array.from(new Set(votes.map((vote) => vote.height)));

  const [proposals, totalClosedProposals, delegatedStake] = await Promise.all([
    proposalIds.length
      ? db.proposal.findMany({
          where: { chainId, proposalId: { in: proposalIds } },
          select: { proposalId: true, title: true, status: true, finalTallyResult: true },
        })
      : Promise.resolve([]),
    db.proposal.count({
      where: {
        chainId,
        status: { in: [...CLOSED_GOVERNANCE_PROPOSAL_STATUSES] },
      },
    }),
    heights.length
      ? DelegatedStakeService.getDelegatedStakeAtHeights(chainName, address, heights)
      : Promise.resolve(null),
  ]);

  const proposalsById = new Map(proposals.map((proposal) => [proposal.proposalId, proposal]));
  const stakeByHeight = new Map(delegatedStake?.values.map((point) => [point.height, point.amounts]));

  const rows = votes.map<AccountVoteRow>((vote) => {
    const proposal = proposalsById.get(vote.proposal_id);
    if (!proposal) {
      return {
        proposalId: vote.proposal_id,
        proposalTitle: null,
        option: vote.option,
        weight: vote.weight,
        height: vote.height,
        txHash: vote.tx_hash,
        isClosed: false,
        impactBasisPoints: null,
        impactUnavailableReason: 'proposal-unavailable',
      };
    }

    const isClosed = isClosedGovernanceProposalStatus(proposal.status);
    if (!isClosed) {
      return {
        proposalId: vote.proposal_id,
        proposalTitle: proposal.title,
        option: vote.option,
        weight: vote.weight,
        height: vote.height,
        txHash: vote.tx_hash,
        isClosed,
        impactBasisPoints: null,
        impactUnavailableReason:
          proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD' || proposal.status === 'PROPOSAL_STATUS_DEPOSIT_PERIOD'
            ? 'voting-in-progress'
            : 'tally-unavailable',
      };
    }

    const tally = parseFinalTally(proposal.finalTallyResult);
    if (!tally || tally.total === BigInt(0)) {
      return {
        proposalId: vote.proposal_id,
        proposalTitle: proposal.title,
        option: vote.option,
        weight: vote.weight,
        height: vote.height,
        txHash: vote.tx_hash,
        isClosed,
        impactBasisPoints: null,
        impactUnavailableReason: 'tally-unavailable',
      };
    }

    const amounts = stakeByHeight.get(vote.height);
    const stake = amounts?.[minimalDenom];
    if (!stake) {
      if (amounts && Object.keys(amounts).length > 0) {
        logWarn(`Delegated stake denom mismatch for ${chainName} at height ${vote.height}`);
      }
      return {
        proposalId: vote.proposal_id,
        proposalTitle: proposal.title,
        option: vote.option,
        weight: vote.weight,
        height: vote.height,
        txHash: vote.tx_hash,
        isClosed,
        impactBasisPoints: null,
        impactUnavailableReason: 'stake-unavailable',
      };
    }

    const impactBasisPoints = calculateImpactBasisPoints(stake, tally.total);
    return {
      proposalId: vote.proposal_id,
      proposalTitle: proposal.title,
      option: vote.option,
      weight: vote.weight,
      height: vote.height,
      txHash: vote.tx_hash,
      isClosed,
      impactBasisPoints: impactBasisPoints?.toString() ?? null,
      impactUnavailableReason: impactBasisPoints === null ? 'stake-unavailable' : null,
    };
  });

  return {
    status: 'ready',
    rows,
    totalVotes,
    totalClosedProposals,
    truncated,
  };
};

const votingHistoryInflight = new Map<string, Promise<AccountVotingHistoryReady | null>>();

const getCachedVotingHistory = (
  chainName: string,
  address: string,
  chainId: number,
  minimalDenom: string,
): Promise<AccountVotingHistoryReady | null> => {
  const key = CACHE_KEYS.account.govVotes(chainName, address, 'all');
  const existing = votingHistoryInflight.get(key);
  if (existing) return existing;

  const promise = cacheGetOrFetch<AccountVotingHistoryReady>(
    key,
    () => loadVotingHistory(chainName, address, chainId, minimalDenom),
    CACHE_TTL.MEDIUM,
  ).finally(() => votingHistoryInflight.delete(key));

  votingHistoryInflight.set(key, promise);
  return promise;
};

export const getAccountVotingHistory = async (
  chainName: string,
  address: string,
): Promise<AccountVotingHistoryResult> => {
  const normalizedChainName = chainName.toLowerCase();
  if (!isGovVotesChainSupported(normalizedChainName)) return { status: 'unsupported' };

  try {
    const context = await getChainLcdContext(normalizedChainName);
    if (!context) return { status: 'error' };

    const normalizedAddress = normalizeBech32Address(address, context.bech32Prefix);
    if (!normalizedAddress) return { status: 'unsupported' };

    const ready = await getCachedVotingHistory(normalizedChainName, normalizedAddress, context.id, context.minimalDenom);
    return ready ?? { status: 'error' };
  } catch (error) {
    logError(
      `Failed to load account governance for ${normalizedChainName}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      error,
    );
    return { status: 'error' };
  }
};

const AccountGovernanceService = { getAccountVotingHistory };

export default AccountGovernanceService;
