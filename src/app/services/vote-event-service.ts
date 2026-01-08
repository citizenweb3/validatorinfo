import { eventsClient } from '@/db';
import { SortDirection } from '@/server/types';

interface VoteEventFilters {
  chainId?: number;
  proposalId?: string;
  voter?: string;
  support?: boolean;
}

interface VoteStats {
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  uniqueVoters: number;
  votingPowerFor: bigint;
  votingPowerAgainst: bigint;
}

const getVoteEvents = async (
  filters: VoteEventFilters = {},
  skip: number = 0,
  take: number = 10,
  sortBy: string = 'timestamp',
  order: SortDirection = 'desc',
) => {
  const where: any = {};

  if (filters.chainId) {
    where.chainId = filters.chainId;
  }

  if (filters.proposalId !== undefined) {
    where.proposalId = filters.proposalId;
  }

  if (filters.voter) {
    where.voter = { equals: filters.voter, mode: 'insensitive' };
  }

  if (filters.support !== undefined) {
    where.support = filters.support;
  }

  const [events, totalCount] = await Promise.all([
    eventsClient.aztecVoteCastEvent.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
    }),
    eventsClient.aztecVoteCastEvent.count({ where }),
  ]);

  return {
    events,
    totalCount,
    pages: Math.ceil(totalCount / take),
  };
};

const getProposalVoteStats = async (chainId: number, proposalId: string): Promise<VoteStats> => {
  const votes = await eventsClient.aztecVoteCastEvent.findMany({
    where: { chainId, proposalId },
    select: {
      support: true,
      voter: true,
      amount: true,
    },
  });

  const uniqueVoters = new Set(votes.map((v) => v.voter.toLowerCase())).size;
  const votesFor = votes.filter((v) => v.support).length;
  const votesAgainst = votes.filter((v) => !v.support).length;

  const votingPowerFor = votes.filter((v) => v.support).reduce((sum, v) => sum + BigInt(v.amount), BigInt(0));

  const votingPowerAgainst = votes.filter((v) => !v.support).reduce((sum, v) => sum + BigInt(v.amount), BigInt(0));

  return {
    totalVotes: votes.length,
    votesFor,
    votesAgainst,
    uniqueVoters,
    votingPowerFor,
    votingPowerAgainst,
  };
};

const getProposalVotes = async (chainId: number, proposalId: string, skip: number = 0, take: number = 50) => {
  const where = { chainId, proposalId };

  const [votes, totalCount] = await Promise.all([
    eventsClient.aztecVoteCastEvent.findMany({
      where,
      skip,
      take,
      orderBy: { timestamp: 'desc' },
    }),
    eventsClient.aztecVoteCastEvent.count({ where }),
  ]);

  return {
    votes,
    totalCount,
    pages: Math.ceil(totalCount / take),
  };
};

const getVoterHistory = async (chainId: number, voterAddress: string, skip: number = 0, take: number = 10) => {
  const where = {
    chainId,
    voter: { equals: voterAddress, mode: 'insensitive' as const },
  };

  const [votes, totalCount] = await Promise.all([
    eventsClient.aztecVoteCastEvent.findMany({
      where,
      skip,
      take,
      orderBy: { timestamp: 'desc' },
    }),
    eventsClient.aztecVoteCastEvent.count({ where }),
  ]);

  const votesFor = votes.filter((v) => v.support).length;
  const votesAgainst = votes.filter((v) => !v.support).length;

  return {
    votes,
    totalCount,
    votesFor,
    votesAgainst,
    pages: Math.ceil(totalCount / take),
  };
};

const getRecentVotes = async (chainId: number, limit: number = 10) => {
  return eventsClient.aztecVoteCastEvent.findMany({
    where: { chainId },
    take: limit,
    orderBy: { timestamp: 'desc' },
  });
};

const hasVoted = async (chainId: number, proposalId: string, voterAddress: string): Promise<boolean> => {
  const vote = await eventsClient.aztecVoteCastEvent.findFirst({
    where: {
      chainId,
      proposalId,
      voter: { equals: voterAddress, mode: 'insensitive' },
    },
  });

  return vote !== null;
};

const getVoteDistribution = async (chainId: number) => {
  const votes = await eventsClient.aztecVoteCastEvent.findMany({
    where: { chainId },
    select: {
      proposalId: true,
      support: true,
      amount: true,
    },
  });

  const grouped = votes.reduce(
    (acc, vote) => {
      const key = vote.proposalId;
      if (!acc[key]) {
        acc[key] = {
          proposalId: vote.proposalId,
          votesFor: 0,
          votesAgainst: 0,
          powerFor: BigInt(0),
          powerAgainst: BigInt(0),
        };
      }
      if (vote.support) {
        acc[key].votesFor++;
        acc[key].powerFor += BigInt(vote.amount);
      } else {
        acc[key].votesAgainst++;
        acc[key].powerAgainst += BigInt(vote.amount);
      }
      return acc;
    },
    {} as Record<
      string,
      {
        proposalId: string;
        votesFor: number;
        votesAgainst: number;
        powerFor: bigint;
        powerAgainst: bigint;
      }
    >,
  );

  return Object.values(grouped);
};

const VoteEventService = {
  getVoteEvents,
  getProposalVoteStats,
  getProposalVotes,
  getVoterHistory,
  getRecentVotes,
  hasVoted,
  getVoteDistribution,
};

export default VoteEventService;
