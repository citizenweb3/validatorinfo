import { Node, Price, Prisma } from '@prisma/client';

import db from '@/db';
import { SortDirection } from '@/server/types';
import ChainWhereInput = Prisma.ChainWhereInput;

export type ChainWithParams = Prisma.ChainGetPayload<{ include: { params: true } }>;
export type ChainWithParamsAndTokenomics = Prisma.ChainGetPayload<{ include: { params: true; tokenomics: true } }>;

export type NetworkValidatorsWithNodes = Node & {
  validator: {
    url: string | null;
    moniker: string;
  } | null;
  chain: {
    name: string;
    tokenomics: {
      bondedTokens: string;
    } | null;
    params: {
      coinDecimals: number;
      blocksWindow: number | null;
    } | null;
  };
  votingPower: number;
  totalSlots: number | null;
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

  const allNodes = await db.node.findMany({
    where,
    include: {
      validator: {
        select: {
          url: true,
          moniker: true,
        },
      },
      chain: {
        select: {
          name: true,
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
      consensusData: {
        select: {
          totalSlots: true,
        },
      },
    },
  });

  const validatorNodesMap = new Map<number, typeof allNodes>();

  for (const node of allNodes) {
    if (!node.validatorId) continue;

    if (!validatorNodesMap.has(node.validatorId)) {
      validatorNodesMap.set(node.validatorId, []);
    }
    validatorNodesMap.get(node.validatorId)!.push(node);
  }

  const chainName = allNodes[0]?.chain?.name;
  const needsConsensusData = chainName && ['aztec', 'aztec-testnet', 'ethereum', 'ethereum-sepolia'].includes(chainName);

  const aggregatedValidators = Array.from(validatorNodesMap.entries()).map(([validatorId, nodes]) => {
    const firstNode = nodes[0];

    const totalTokens = nodes.reduce((sum, node) => sum + BigInt(node.tokens), BigInt(0));
    const totalDelegatorShares = nodes.reduce((sum, node) => sum + parseFloat(node.delegatorShares), 0);
    const nodesWithMissedBlocks = nodes.filter(node => node.missedBlocks !== null && node.missedBlocks !== undefined);
    const totalMissedBlocks = nodesWithMissedBlocks.length > 0
      ? nodesWithMissedBlocks.reduce((sum, node) => sum + node.missedBlocks!, 0)
      : null;
    const totalOutstandingRewards = nodes.reduce((sum, node) => {
      const rewards = node.outstandingRewards ? parseFloat(node.outstandingRewards) : 0;
      return sum + rewards;
    }, 0);
    const totalOutstandingCommissions = nodes.reduce((sum, node) => {
      const commissions = node.outstandingCommissions ? parseFloat(node.outstandingCommissions) : 0;
      return sum + commissions;
    }, 0);
    const totalDelegatorsAmount = nodes.reduce((sum, node) => sum + (node.delegatorsAmount || 0), 0);

    const nodesWithUptime = nodes.filter(node => node.uptime !== null && node.uptime !== undefined);
    const avgUptime = nodesWithUptime.length > 0
      ? nodesWithUptime.reduce((sum, node) => sum + node.uptime!, 0) / nodesWithUptime.length
      : null;

    const isJailed = nodes.some(node => node.jailed);

    const bondedTokens = parseFloat(firstNode.chain?.tokenomics?.bondedTokens || '0');
    const votingPower = bondedTokens !== 0 ? (totalDelegatorShares / bondedTokens) * 100 : 0;

    let totalSlots: number | null = null;
    if (needsConsensusData) {
      let slotsSum = 0;
      let hasSlots = false;

      for (const node of nodes) {
        const slots = node.consensusData?.totalSlots;
        if (slots !== undefined && slots !== null) {
          slotsSum += slots;
          hasSlots = true;
        }
      }

      totalSlots = hasSlots ? slotsSum : null;
    }

    return {
      ...firstNode,
      tokens: totalTokens.toString(),
      delegatorShares: totalDelegatorShares.toString(),
      missedBlocks: totalMissedBlocks,
      outstandingRewards: totalOutstandingRewards > 0 ? totalOutstandingRewards.toString() : null,
      outstandingCommissions: totalOutstandingCommissions > 0 ? totalOutstandingCommissions.toString() : null,
      delegatorsAmount: totalDelegatorsAmount,
      uptime: avgUptime,
      jailed: isJailed,
      votingPower,
      totalSlots,
    };
  });

  aggregatedValidators.sort((a, b) => {
    if (a.jailed !== b.jailed) {
      return a.jailed ? 1 : -1;
    }

    let aVal: any;
    let bVal: any;

    if (sortBy === 'votingPower') {
      aVal = a.votingPower;
      bVal = b.votingPower;
    } else if (sortBy === 'tokens' || sortBy === 'delegatorShares') {
      aVal = parseFloat(a[sortBy] || '0');
      bVal = parseFloat(b[sortBy] || '0');
    } else if (sortBy === 'missedBlocks' || sortBy === 'delegatorsAmount') {
      aVal = a[sortBy] || 0;
      bVal = b[sortBy] || 0;
    } else if (sortBy === 'uptime') {
      aVal = a.uptime || 0;
      bVal = b.uptime || 0;
    } else {
      aVal = a[sortBy as keyof typeof a] || '';
      bVal = b[sortBy as keyof typeof b] || '';
    }

    if (typeof aVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const totalCount = aggregatedValidators.length;
  const pages = Math.ceil(totalCount / take);
  const paginated = aggregatedValidators.slice(skip, skip + take);

  return { validators: paginated, pages };
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
