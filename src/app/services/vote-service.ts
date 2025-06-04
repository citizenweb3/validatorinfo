import db from '@/db';
import { SortDirection } from '@/server/types';
import { VoteOption } from '@prisma/client';

export interface ValidatorVote {
  chain: {
    id: number;
    prettyName: string;
    ecosystem: string
  };
  proposalDbId: number;
  proposalId: string;
  title: string;
  vote: VoteOption;
}

export interface ProposalValidatorsVotes {
  validator: {
    id: number;
    moniker: string;
    iconUrl: string | null;
  };
  vote: VoteOption | null;
}

export interface ChainNodeVote {
  chainDbId: number;
  proposalId: string;
  proposalType: string;
  votingEndTime: Date | null;
  title: string;
  vote: VoteOption;
}

const getValidatorVotes = async (
  validatorId: number,
  skip: number,
  take: number,
  sortBy: string = 'chain',
  order: SortDirection = 'asc',
): Promise<{ votes: ValidatorVote[]; pages: number }> => {
  const where = { node: { validatorId } };

  const total = await db.nodeVote.count({ where });
  const pages = Math.ceil(total / take);

  const orderBy =
    sortBy === 'vote'
      ? [{ vote: order }]
      : [{ chain: { prettyName: order } }];

  const rowVotes = await db.nodeVote.findMany({
    where,
    skip,
    take,
    orderBy,
    select: {
      vote: true,
      chain: { select: { id: true, prettyName: true, ecosystem: true } },
      proposal: {
        select: {
          id: true,
          proposalId: true,
          title: true,
        },
      },
    },
  });

  const votes: ValidatorVote[] = rowVotes.map((vote) => ({
    chain: vote.chain,
    proposalDbId: vote.proposal.id,
    proposalId: vote.proposal.proposalId,
    title: vote.proposal.title,
    vote: vote.vote,
  }));

  return { votes, pages };
};

export const getProposalValidatorsVotes = async (
  chainDbId: number,
  proposalPublicId: string,
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
  filter: string = 'all',
  searchValidatorId?: number,
): Promise<{ votes: ProposalValidatorsVotes[]; pages: number }> => {
  const proposalDb = await db.proposal.findFirst({
    where: { chainId: chainDbId, proposalId: proposalPublicId },
    select: { id: true },
  });
  if (!proposalDb) return { votes: [], pages: 0 };

  const rowVotes = await db.nodeVote.findMany({
    where: {
      proposalId: proposalDb.id,
      node: { validatorId: { not: null } },
    },
    select: {
      vote: true,
      node: { select: { validatorId: true } },
    },
  });

  const voteMap = new Map<number, VoteOption>();
  rowVotes.forEach((r) => voteMap.set(r.node.validatorId!, r.vote));

  const nodeValidators = await db.node.findMany({
    where: {
      chainId: chainDbId,
      validatorId: { not: null },
    },
    distinct: ['validatorId'],
    select: {
      validator: { select: { id: true, moniker: true, url: true } },
    },
  });

  const allValidators = nodeValidators.map((n) => n.validator!).filter(Boolean);

  let fullList: ProposalValidatorsVotes[] = allValidators.map((v) => ({
    validator: { id: v.id, moniker: v.moniker, iconUrl: v.url },
    vote: voteMap.get(v.id) ?? null,
  }));

  if (searchValidatorId) {
    fullList = fullList.filter((v) => v.validator.id === searchValidatorId);
  }

  if (filter !== 'all') {
    fullList = fullList.filter((item) => {
      switch (filter) {
        case 'yes':
          return item.vote === VoteOption.YES;
        case 'no':
          return item.vote === VoteOption.NO;
        case 'veto':
          return item.vote === VoteOption.VETO;
        case 'did_not_vote':
          return item.vote === null || item.vote === VoteOption.UNSPECIFIED;
        default:
          return true;
      }
    });
  }

  const orderRank = { YES: 0, NO: 1, ABSTAIN: 2, VETO: 3, UNSPECIFIED: 4 };

  fullList.sort((a, b) => {
    if (sortBy === 'vote') {
      const av = (a.vote ?? VoteOption.UNSPECIFIED) as keyof typeof orderRank;
      const bv = (b.vote ?? VoteOption.UNSPECIFIED) as keyof typeof orderRank;
      return order === 'asc'
        ? orderRank[av] - orderRank[bv]
        : orderRank[bv] - orderRank[av];
    }
    return order === 'asc'
      ? a.validator.moniker.localeCompare(b.validator.moniker)
      : b.validator.moniker.localeCompare(a.validator.moniker);
  });

  const pages = Math.ceil(fullList.length / take);
  const votes = fullList.slice(skip, skip + take);

  return { votes, pages };
};

const getChainNodeVotes = async (
  operatorAddress: string,
  skip: number,
  take: number,
  sortBy: string = 'date',
  order: SortDirection = 'desc',
): Promise<{ votes: ChainNodeVote[]; pages: number }> => {

  const node = await db.node.findUnique({
    where: { operatorAddress },
    select: { id: true, chainId: true },
  });

  if (!node) {
    return { votes: [], pages: 0 };
  }

  const where = {
    nodeId: node.id,
    chainId: node.chainId,
  };

  const total = await db.nodeVote.count({ where });
  const pages = Math.ceil(total / take);

  const orderBy =
    sortBy === 'vote'
      ? [{ vote: order }]
      : sortBy === 'type'
        ? [{ proposal: { type: order } }]
        : sortBy === 'proposal'
          ? [{ proposal: { proposalId: order } }]
          : [{ proposal: { votingEndTime: order } }];

  const voteRows = await db.nodeVote.findMany({
    where,
    skip,
    take,
    orderBy,
    select: {
      vote: true,
      chain: { select: { id: true, prettyName: true, ecosystem: true } },
      proposal: {
        select: {
          id: true,
          proposalId: true,
          type: true,
          votingEndTime: true,
          title: true,
        },
      },
    },
  });

  if (voteRows.length === 0) {
    return { votes: [], pages: 0 };
  }

  const votes: ChainNodeVote[] = voteRows.map((vote) => ({
    chainDbId: vote.chain.id,
    proposalId: vote.proposal.proposalId,
    proposalType: vote.proposal.type,
    votingEndTime: vote.proposal.votingEndTime,
    title: vote.proposal.title,
    vote: vote.vote,
  }));

  return { votes, pages };
};

const voteService = {
  getValidatorVotes,
  getProposalValidatorsVotes,
  getChainNodeVotes,
};

export default voteService;
