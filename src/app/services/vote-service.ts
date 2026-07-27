import { VoteOption } from '@prisma/client';

import db from '@/db';
import { SortDirection } from '@/server/types';

export interface ValidatorVote {
  chain: {
    id: number;
    name: string;
    prettyName: string;
    ecosystem: string;
  };
  proposalDbId: number;
  proposalId: string;
  title: string;
  vote: VoteOption;
  operatorAddress: string;
}

export interface ProposalValidatorsVotes {
  validator: {
    id: number;
    moniker: string;
    iconUrl: string | null;
  };
  vote: VoteOption | null;
  txHash: string | null;
}

export interface ChainNodeVote {
  chainDbId: number;
  chainName: string;
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

  const orderBy = sortBy === 'vote' ? [{ vote: order }] : [{ chain: { prettyName: order } }];

  const rowVotes = await db.nodeVote.findMany({
    where,
    skip,
    take,
    orderBy,
    select: {
      vote: true,
      chain: { select: { id: true, name: true, prettyName: true, ecosystem: true } },
      proposal: {
        select: {
          id: true,
          proposalId: true,
          title: true,
        },
      },
      node: { select: { operatorAddress: true } },
    },
  });

  const votes: ValidatorVote[] = rowVotes.map((vote) => ({
    chain: vote.chain,
    proposalDbId: vote.proposal.id,
    proposalId: vote.proposal.proposalId,
    title: vote.proposal.title,
    vote: vote.vote,
    operatorAddress: vote.node.operatorAddress,
  }));

  return { votes, pages };
};

export const getProposalValidatorsVotes = async (
  chainName: string,
  proposalPublicId: string,
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
  filter: string = 'all',
  searchValidatorId?: number,
): Promise<{ votes: ProposalValidatorsVotes[]; pages: number }> => {
  const chainDbId = await db.chain.findUnique({ where: { name: chainName } });
  if (!chainDbId) return { votes: [], pages: 0 };

  const proposalDb = await db.proposal.findFirst({
    where: { chainId: chainDbId.id, proposalId: proposalPublicId },
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
      txHash: true,
      node: { select: { validatorId: true } },
    },
  });

  const voteMap = new Map<number, VoteOption>();
  const txHashMap = new Map<number, string | null>();
  rowVotes.forEach((r) => {
    voteMap.set(r.node.validatorId!, r.vote);
    txHashMap.set(r.node.validatorId!, r.txHash);
  });

  const nodeValidators = await db.node.findMany({
    where: {
      chainId: chainDbId.id,
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
    txHash: txHashMap.get(v.id) ?? null,
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
      return order === 'asc' ? orderRank[av] - orderRank[bv] : orderRank[bv] - orderRank[av];
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
      chain: { select: { id: true, name: true, prettyName: true, ecosystem: true } },
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
    chainName: vote.chain.name,
    proposalId: vote.proposal.proposalId,
    proposalType: vote.proposal.type,
    votingEndTime: vote.proposal.votingEndTime,
    title: vote.proposal.title,
    vote: vote.vote,
  }));

  return { votes, pages };
};

export type NodeVotingStatus = 'voted' | 'never' | 'unknown';

/**
 * Whether the node has ever cast a governance vote. 'unknown' means the chain has no indexed
 * votes at all (vote indexing is not enabled for it), so callers should fall back to a proxy
 * instead of rendering a definitive negative.
 */
const getNodeVotingStatus = async (nodeId: number, chainId: number): Promise<NodeVotingStatus> => {
  const nodeVote = await db.nodeVote.findFirst({ where: { nodeId }, select: { id: true } });
  if (nodeVote) {
    return 'voted';
  }

  const chainVote = await db.nodeVote.findFirst({ where: { chainId }, select: { id: true } });
  return chainVote ? 'never' : 'unknown';
};

export interface SameOpinionValidator {
  nodeId: number;
  validatorId: number | null;
  operatorAddress: string;
  moniker: string;
  icon: string | null;
  wilsonScore: number;
  matchedPercent: number;
  commonProposals: number;
}

// One shared proposal would make every full match a meaningless 100% — require a minimal overlap.
const MIN_COMMON_PROPOSALS = 3;

// Wilson lower bound (95%) of the match proportion. Ranking by raw percent lets a 100% over 3-4
// shared proposals outrank 85% over 13 — the confidence bound penalizes tiny overlaps instead.
const wilsonLowerBound = (matched: number, common: number): number => {
  if (common === 0) return 0;

  const z = 1.96;
  const z2 = z * z;
  const p = matched / common;
  const centre = p + z2 / (2 * common);
  const margin = z * Math.sqrt((p * (1 - p)) / common + z2 / (4 * common * common));
  return (centre - margin) / (1 + z2 / common);
};

const getNodeSameOpinionValidators = async (
  operatorAddress: string,
  skip: number,
  take: number,
  sortBy: string = 'score',
  order: SortDirection = 'desc',
): Promise<{ validators: SameOpinionValidator[]; pages: number }> => {
  const node = await db.node.findUnique({
    where: { operatorAddress },
    select: { id: true, chainId: true },
  });

  if (!node) {
    return { validators: [], pages: 0 };
  }

  const rows = await db.$queryRaw<{ node_id: number; common: bigint; matched: bigint }[]>`
    SELECT nv.node_id,
           COUNT(*) AS common,
           COUNT(*) FILTER (WHERE nv.vote = my.vote) AS matched
    FROM node_votes nv
    JOIN node_votes my ON my.proposal_id = nv.proposal_id AND my.node_id = ${node.id}
    WHERE nv.chain_id = ${node.chainId}
      AND nv.node_id <> ${node.id}
    GROUP BY nv.node_id
    HAVING COUNT(*) >= ${MIN_COMMON_PROPOSALS}
  `;

  if (rows.length === 0) {
    return { validators: [], pages: 0 };
  }

  const ranked = rows.map((row) => {
    const commonProposals = Number(row.common);
    const matched = Number(row.matched);
    return {
      nodeId: row.node_id,
      commonProposals,
      matchedPercent: (matched / commonProposals) * 100,
      matchScore: wilsonLowerBound(matched, commonProposals),
    };
  });

  const direction = order === 'asc' ? 1 : -1;
  const sortValue = (row: (typeof ranked)[number]): number =>
    sortBy === 'common' ? row.commonProposals : sortBy === 'match' ? row.matchedPercent : row.matchScore;
  ranked.sort((a, b) => {
    const diff = sortValue(a) - sortValue(b);
    if (diff !== 0) return diff * direction;
    return b.matchScore - a.matchScore || b.commonProposals - a.commonProposals;
  });

  const pages = Math.ceil(ranked.length / take);
  const pageRows = ranked.slice(skip, skip + take);

  const pageNodes = await db.node.findMany({
    where: { id: { in: pageRows.map((row) => row.nodeId) } },
    select: {
      id: true,
      moniker: true,
      operatorAddress: true,
      validatorId: true,
      validator: { select: { moniker: true, url: true } },
    },
  });
  const nodeById = new Map(pageNodes.map((pageNode) => [pageNode.id, pageNode]));

  const validators: SameOpinionValidator[] = pageRows.map((row) => {
    const rowNode = nodeById.get(row.nodeId);
    return {
      nodeId: row.nodeId,
      validatorId: rowNode?.validatorId ?? null,
      operatorAddress: rowNode?.operatorAddress ?? '',
      moniker: rowNode?.validator?.moniker ?? rowNode?.moniker ?? '',
      icon: rowNode?.validator?.url ?? null,
      wilsonScore: row.matchScore,
      matchedPercent: row.matchedPercent,
      commonProposals: row.commonProposals,
    };
  });

  return { validators, pages };
};

export interface ValidatorVoteChain {
  chainName: string;
  prettyName: string;
  operatorAddress: string;
  votes: number;
}

// Chains where the validator's nodes have indexed votes — drives both the visibility of the
// validator-level "Similar Opinions" button and its network filter. Most-voted chain first.
const getValidatorVoteChains = async (validatorId: number): Promise<ValidatorVoteChain[]> => {
  const nodes = await db.node.findMany({
    where: { validatorId, votes: { some: {} } },
    select: {
      operatorAddress: true,
      chain: { select: { name: true, prettyName: true } },
      _count: { select: { votes: true } },
    },
  });

  return nodes
    .map((node) => ({
      chainName: node.chain.name,
      prettyName: node.chain.prettyName,
      operatorAddress: node.operatorAddress,
      votes: node._count.votes,
    }))
    .sort((a, b) => b.votes - a.votes);
};

const voteService = {
  getValidatorVotes,
  getProposalValidatorsVotes,
  getChainNodeVotes,
  getNodeVotingStatus,
  getNodeSameOpinionValidators,
  getValidatorVoteChains,
};

export default voteService;
