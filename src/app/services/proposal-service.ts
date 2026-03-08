import { Proposal, ProposalStatus } from '@prisma/client';
import db from '@/db';
import { SortDirection } from '@/server/types';

export type ProposalListItem = Omit<Proposal, 'fullText' | 'aiSummary'>;

const getListByChainId = async (chainId: number) => {
  return db.proposal.findMany({ where: { chainId }, omit: { fullText: true, aiSummary: true } });
};

const getPastProposalsByChainId = async (
  chainId: number,
  skip: number,
  take: number,
  sortBy: string = 'votingEndTime',
  order: SortDirection = 'desc',
) => {
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
    omit: { fullText: true, aiSummary: true },
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

const getListByChainName = async (chainName: string) => {
  const chain = await db.chain.findUnique({ where: { name: chainName } });
  if (!chain) return [];
  return db.proposal.findMany({ where: { chainId: chain.id }, omit: { fullText: true, aiSummary: true } });
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

const getLiveProposalsByChainId = async (chainId: number) => {
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
    omit: { fullText: true, aiSummary: true },
  });
};


const getProposalsWithStats = async (chainId: number) => {
  return db.proposal.findMany({
    where: { chainId },
    orderBy: { submitTime: 'desc' },
    omit: { fullText: true, aiSummary: true },
  });
};

const saveAiSummary = async (
  chainId: number,
  proposalId: string,
  locale: string,
  summary: string,
): Promise<void> => {
  await db.$executeRaw`
    UPDATE proposals
    SET ai_summary = COALESCE(ai_summary, '{}'::jsonb) || ${JSON.stringify({ [locale]: summary })}::jsonb
    WHERE chain_id = ${chainId} AND proposal_id = ${proposalId}
  `;
};

const ProposalService = {
  getPastProposalsByChainId,
  getListByChainId,
  getProposalById,
  getListByChainName,
  getProposalByChainNameAndId,
  getLiveProposalsByChainId,
  getProposalsWithStats,
  saveAiSummary,
};

export default ProposalService;
