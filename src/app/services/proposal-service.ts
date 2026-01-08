import { Proposal, ProposalStatus } from '@prisma/client';
import db from '@/db';
import { SortDirection } from '@/server/types';

const getListByChainId = async (chainId: number): Promise<Proposal[]> => {
  return db.proposal.findMany({ where: { chainId } });
};

const getPastProposalsByChainId = async (
  chainId: number,
  skip: number,
  take: number,
  sortBy: string = 'votingEndTime',
  order: SortDirection = 'desc',
): Promise<{ proposals: Proposal[]; pages: number }> => {
  const where = {
    chainId,
    status: {
      in: [
        ProposalStatus.PROPOSAL_STATUS_REJECTED,
        ProposalStatus.PROPOSAL_STATUS_PASSED,
        ProposalStatus.PROPOSAL_STATUS_FAILED,
        ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED,
      ],
    },
  };

  const proposals = await db.proposal.findMany({
    where: where,
    skip,
    take,
    orderBy: { [sortBy]: order },
  });

  const count = await db.proposal.count({ where: where });
  return { proposals, pages: Math.ceil(count / take) };
};

const getProposalById = async (chainId: number, proposalId: string): Promise<Proposal | null> => {
  return db.proposal.findUnique({
    where: {
      chainId_proposalId: {
        chainId: chainId,
        proposalId: proposalId,
      },
    },
  });
};

const getListByChainName = async (chainName: string): Promise<Proposal[]> => {
  const chain = await db.chain.findUnique({ where: { name: chainName } });
  if (!chain) return [];
  return db.proposal.findMany({ where: { chainId: chain.id } });
};

const getProposalByChainNameAndId = async (
  chainName: string,
  proposalId: string,
): Promise<Proposal | null> => {
  const chain = await db.chain.findUnique({ where: { name: chainName } });
  if (!chain) return null;

  return db.proposal.findUnique({
    where: {
      chainId_proposalId: {
        chainId: chain.id,
        proposalId: proposalId,
      },
    },
  });
};

const getLiveProposalsByChainId = async (chainId: number): Promise<Proposal[]> => {
  return db.proposal.findMany({
    where: {
      chainId,
      status: {
        in: [
          ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
          ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD,
        ],
      },
    },
    orderBy: { votingEndTime: 'asc' },
  });
};


const getProposalsWithStats = async (chainId: number): Promise<Proposal[]> => {
  return db.proposal.findMany({
    where: { chainId },
    orderBy: { submitTime: 'desc' },
  });
};

const ProposalService = {
  getPastProposalsByChainId,
  getListByChainId,
  getProposalById,
  getListByChainName,
  getProposalByChainNameAndId,
  getLiveProposalsByChainId,
  getProposalsWithStats,
};

export default ProposalService;
