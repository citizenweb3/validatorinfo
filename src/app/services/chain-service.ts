import { Chain, Node, Price, Prisma } from '@prisma/client';

import db from '@/db';
import { SortDirection } from '@/server/types';
import ChainWhereInput = Prisma.ChainWhereInput;

export type NetworkValidatorsWithNodes = Node & {
  validator: {
    url: string | null;
  } | null;
  chain: {
    coinDecimals: number;
  };
}

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

const getChainValidatorsWithNodes = async (
  id: number,
  nodeStatus: string[],
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
): Promise<{ validators: NetworkValidatorsWithNodes[]; pages: number }> => {
  const where: any = {
    chain: { id: id },
    validatorId: { not: null },
  };

  if (nodeStatus && nodeStatus.length > 0 && !nodeStatus.includes('all')) {
    const jailedSelected = nodeStatus.includes('jailed');
    const unjailedSelected = nodeStatus.includes('unjailed');
    if (jailedSelected && !unjailedSelected) {
      where.jailed = true;
    } else if (unjailedSelected && !jailedSelected) {
      where.jailed = false;
    }
  }

  const orderBy =
    sortBy === 'moniker' ? { moniker: order } : { [sortBy]: order };

  const totalCount = await db.node.count({ where });
  const pages = Math.ceil(totalCount / take);

  const validators = await db.node.findMany({
    where,
    skip,
    take,
    orderBy: [
      { jailed: 'asc' },
      orderBy,
    ],
    include: {
      validator: {
        select: {
          url: true,
        },
      },
      chain: {
        select: {
          coinDecimals: true,
        },
      },
    },
  });

  return { validators, pages };
};


const ChainService = {
  getAll,
  getTokenPriceByChainId,
  getById,
  getEcosystemsChains,
  getChainValidatorsWithNodes,
};

export default ChainService;
