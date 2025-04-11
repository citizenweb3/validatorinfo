import { SortDirection } from '@/server/types';
import { Proposal, ProposalStatus } from '@prisma/client';
import db from '@/db';

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
  return db.proposal.findUnique(
    {
      where: {
        chainId_proposalId: {
          chainId: chainId,
          proposalId: proposalId,
        },
      },
    },
  );
};


const ProposalService = {
  getPastProposalsByChainId,
  getListByChainId,
  getProposalById,
};

export default ProposalService;
