import db from '@/db';
import { Chain } from '@/types';

const getAll = async (): Promise<Chain[]> =>
  db.chain.findMany({
    include: { github: true, apr: true, priceChart: { orderBy: { date: 'desc' }, take: 1 } },
  });

const ChainService = {
  getAll,
};

export default ChainService;
