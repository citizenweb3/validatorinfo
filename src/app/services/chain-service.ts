import { Chain, Price, Prisma } from '@prisma/client';

import db from '@/db';
import { SortDirection } from '@/server/types';
import ChainWhereInput = Prisma.ChainWhereInput;

const getAll = async (
  ecosystems: string[],
  skip: number,
  take: number,
  sortBy: string = 'name',
  order: SortDirection = 'asc',
): Promise<{ chains: Chain[]; pages: number }> => {
  const where: ChainWhereInput | undefined = ecosystems.length ? { ecosystem: { in: ecosystems } } : undefined;
  const chains = await db.chain.findMany({
    where,
    include: { aprs: true, prices: { orderBy: { createdAt: 'desc' }, take: 1 } },
    skip,
    take,
    orderBy: { [sortBy]: order },
  });
  const count = await db.chain.count({ where });
  return { chains, pages: Math.ceil(count / take) };
};

const getTokenPriceByChainId = async (chainId: number): Promise<Price | null> => {
  const price = await db.price.findFirst({
    where: { chainId },
    orderBy: { createdAt: 'desc' },
  });
  return price ?? null;
};

const getById = async (id: number): Promise<Chain | null> => {
  return db.chain.findUnique({
    where: { id },
  });
};

const getEcosystemsChains = async (): Promise<Chain[]> => {
  return db.chain.findMany({
    distinct: ['ecosystem'],
  });
};

const ChainService = {
  getAll,
  getTokenPriceByChainId,
  getById,
  getEcosystemsChains,
};

export default ChainService;
