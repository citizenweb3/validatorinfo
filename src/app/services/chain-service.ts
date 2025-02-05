import { Chain, Price } from '@prisma/client';

import db from '@/db';
import { SortDirection } from '@/services/validator-service';

const getAll = async (
  ecosystems: string[],
  skip: number,
  take: number,
  sortBy: string = 'name',
  order: SortDirection = 'asc',
): Promise<{ chains: Chain[]; pages: number }> => {
  const where = ecosystems.length ? { type: { in: ecosystems } } : undefined;
  const chains = await db.chain.findMany({
    where,
    include: { github: true, apr: true, priceChart: { orderBy: { date: 'desc' }, take: 1 } },
    skip,
    take,
    orderBy: { [sortBy]: order },
  });
  const count = await db.chain.count({ where });
  return { chains, pages: Math.ceil(count / take) };
};

const getTokenPriceByChainId = async (chainId: string): Promise<Price | null> => {
  const price = await db.price.findFirst({
    where: { chainId },
    orderBy: { date: 'desc' },
  });
  return price ?? null;
};

const ChainService = {
  getAll,
  getTokenPriceByChainId,
};

export default ChainService;
