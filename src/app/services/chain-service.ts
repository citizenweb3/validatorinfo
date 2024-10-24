import { Chain } from '@prisma/client';

import db from '@/db';
import { SortDirection } from '@/services/validator-service';

const getAll = async (
  skip: number,
  take: number,
  sortBy: string = 'name',
  order: SortDirection = 'asc',
): Promise<{ chains: Chain[]; pages: number }> => {
  const chains = await db.chain.findMany({
    include: { github: true, apr: true, priceChart: { orderBy: { date: 'desc' }, take: 1 } },
    skip,
    take,
    orderBy: { [sortBy]: order },
  });
  const count = await db.chain.count();
  return { chains, pages: Math.ceil(count / take) };
};
const ChainService = {
  getAll,
};

export default ChainService;
