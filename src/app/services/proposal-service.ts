import { SortDirection } from '@/server/types';
import { Proposal } from '@prisma/client';
import db from '@/db';

const getListByChainId = async (chainId: number): Promise<Proposal[]> => {
  return db.proposal.findMany({ where: { chainId } });
};

const getSortedByChainId = async (
  chainId: number,
  skip: number,
  take: number,
  sortBy: string = 'votingEndTime',
  order: SortDirection = 'desc',
): Promise<{ proposals: Proposal[]; pages: number }> => {
  const proposals = await db.proposal.findMany({
    where: { chainId },
    skip,
    take,
    orderBy: { [sortBy]: order },
  });

  const count = await db.proposal.count({ where: { chainId } });
  return { proposals, pages: Math.ceil(count / take) };
};

const ProposalService = {
  getSortedByChainId,
  getListByChainId,
};

export default ProposalService;
