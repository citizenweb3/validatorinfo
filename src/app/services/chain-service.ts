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
  votingPower: number;
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
    orderBy: { id: 'asc' },
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

  if (sortBy === 'votingPower') {
    const allValidators = await db.node.findMany({
      where,
      include: {
        validator: {
          select: {
            url: true,
          },
        },
        chain: {
          select: {
            coinDecimals: true,
            bondedTokens: true,
          },
        },
      },
    });

    const computedNodes = allValidators.map((node) => {
      const bondedTokens = parseFloat(node.chain?.bondedTokens || '0');
      const delegatorShares = parseFloat(node.delegatorShares || '0');
      const votingPower = bondedTokens !== 0 ? (delegatorShares / bondedTokens) * 100 : 0;
      return { ...node, votingPower };
    });

    computedNodes.sort((a, b) => {
      const aVal = a.votingPower;
      const bVal = b.votingPower;
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const totalCount = computedNodes.length;
    const pages = Math.ceil(totalCount / take);
    const paginated = computedNodes.slice(skip, skip + take);

    return { validators: paginated, pages };
  } else {

    const totalCount = await db.node.count({ where });
    const pages = Math.ceil(totalCount / take);

    const validators = await db.node.findMany({
      where,
      skip,
      take,
      orderBy: [{ jailed: 'asc' }, { [sortBy]: order }],
      include: {
        validator: {
          select: {
            url: true,
          },
        },
        chain: {
          select: {
            coinDecimals: true,
            bondedTokens: true,
          },
        },
      },
    });

    const computedValidators = validators.map((node) => {
      const bondedTokens = parseFloat(node.chain?.bondedTokens || '0');
      const delegatorShares = parseFloat(node.delegatorShares || '0');
      const votingPower = bondedTokens !== 0 ? (delegatorShares / bondedTokens) * 100 : 0;
      return { ...node, votingPower };
    });

    return { validators: computedValidators, pages };
  }
};


const ChainService = {
  getAll,
  getTokenPriceByChainId,
  getById,
  getEcosystemsChains,
  getChainValidatorsWithNodes,
};

export default ChainService;
