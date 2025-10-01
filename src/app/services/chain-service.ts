import { Node, Price, Prisma } from '@prisma/client';

import db from '@/db';
import { SortDirection } from '@/server/types';
import ChainWhereInput = Prisma.ChainWhereInput;

export type ChainWithParams = Prisma.ChainGetPayload<{ include: { params: true } }>;
export type ChainWithParamsAndTokenomics = Prisma.ChainGetPayload<{ include: { params: true; tokenomics: true } }>;

export type NetworkValidatorsWithNodes = Node & {
  validator: {
    url: string | null;
  } | null;
  chain: {
    params: {
      coinDecimals: number;
      blocksWindow: number | null;
    } | null;
  };
  votingPower: number;
};

const getAll = async (
  ecosystems: string[],
  skip: number,
  take: number,
  sortBy: string = 'name',
  order: SortDirection = 'asc',
): Promise<{ chains: ChainWithParamsAndTokenomics[]; pages: number }> => {
  const where: ChainWhereInput | undefined = ecosystems.length ? { ecosystem: { in: ecosystems } } : undefined;

  const orderBy =
    sortBy === 'fdv'
      ? { tokenomics: { fdv: order } }
      : sortBy === 'token'
        ? { params: { denom: order } }
        : { [sortBy]: order };

  const chains = await db.chain.findMany({
    where,
    include: { aprs: true, params: true, tokenomics: true },
    skip,
    take,
    orderBy,
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

const getById = async (id: number): Promise<ChainWithParamsAndTokenomics | null> => {
  return db.chain.findUnique({
    where: { id },
    include: { params: true, tokenomics: true },
  });
};

const getByName = async (name: string): Promise<ChainWithParamsAndTokenomics | null> => {
  return db.chain.findUnique({
    where: { name },
    include: { params: true, tokenomics: true },
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
            tokenomics: {
              select: {
                bondedTokens: true,
              },
            },
            params: {
              select: {
                coinDecimals: true,
                blocksWindow: true,
              },
            },
          },
        },
      },
    });

    const computedNodes = allValidators.map((node) => {
      const bondedTokens = parseFloat(node.chain?.tokenomics?.bondedTokens || '0');
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
            tokenomics: {
              select: {
                bondedTokens: true,
              },
            },
            params: {
              select: {
                coinDecimals: true,
                blocksWindow: true,
              },
            },
          },
        },
      },
    });

    const computedValidators = validators.map((node) => {
      const bondedTokens = parseFloat(node.chain?.tokenomics?.bondedTokens || '0');
      const delegatorShares = parseFloat(node.delegatorShares || '0');
      const votingPower = bondedTokens !== 0 ? (delegatorShares / bondedTokens) * 100 : 0;
      return { ...node, votingPower };
    });

    return { validators: computedValidators, pages };
  }
};

const getListByEcosystem = async (ecosystem: string) => {
  return db.chain.findMany({
    where: { ecosystem },
  });
};

const getAllLight = async () => {
  return db.chain.findMany({});
};

const ChainService = {
  getAll,
  getTokenPriceByChainId,
  getById,
  getChainValidatorsWithNodes,
  getListByEcosystem,
  getByName,
  getAllLight,
};

export default ChainService;
