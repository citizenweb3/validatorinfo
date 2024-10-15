import { Chain } from '@prisma/client';

import db from '@/db';

const getAll = async (skip: number, take: number): Promise<Chain[]> =>
  db.chain.findMany({
    include: { github: true, apr: true, priceChart: { orderBy: { date: 'desc' }, take: 1 } },
    skip,
    take,
  });

const ChainService = {
  getAll,
};

export default ChainService;
