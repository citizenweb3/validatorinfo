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

export type CommitteeMember = {
  operatorAddress: string;
  rewardAddress: string | null;
  moniker: string;
  tokens: string;
  validator: {
    id: number;
    url: string | null;
    moniker: string;
  } | null;
  chain: {
    params: {
      coinDecimals: number;
    } | null;
  };
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

const getAztecValidatorsWithNodes = async (
  chainId: number,
  chainInfo: {
    name: string;
    tokenomics: { bondedTokens: string } | null;
    params: { coinDecimals: number; blocksWindow: number | null } | null;
  } | null,
  nodeStatus: string[],
  skip: number,
  take: number,
  sortBy: string,
  order: SortDirection,
): Promise<{ validators: NetworkValidatorsWithNodes[]; pages: number }> => {
  const chainName = chainInfo?.name || 'aztec';

  const allValidators = await db.validator.findMany({
    where: {
      providerAddresses: {
        path: [chainName],
        not: Prisma.DbNull,
      },
    },
    select: {
      id: true,
      url: true,
      moniker: true,
    },
  });

  const validatorIds = allValidators.map((v) => v.id);

  const nodeWhere: any = {
    chain: { id: chainId },
    validatorId: { in: validatorIds },
  };

  if (nodeStatus && nodeStatus.length > 0 && !nodeStatus.includes('all')) {
    const jailedSelected = nodeStatus.includes('jailed');
    const unjailedSelected = nodeStatus.includes('unjailed');
    if (jailedSelected && !unjailedSelected) {
      nodeWhere.jailed = true;
    } else if (unjailedSelected && !jailedSelected) {
      nodeWhere.jailed = false;
    }
  }

  const allNodes = await db.node.findMany({
    where: nodeWhere,
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

  const bondedTokens = parseFloat(chainInfo?.tokenomics?.bondedTokens || '0');

  const aggregatedValidators: NetworkValidatorsWithNodes[] = allValidators.map((validator) => {
    const nodes = validatorNodesMap.get(validator.id) || [];

    if (nodes.length === 0) {
      return {
        id: -validator.id,
        chainId,
        validatorId: validator.id,
        operatorAddress: '',
        consensusPubkey: '',
        rewardAddress: null,
        accountAddress: null,
        jailed: false,
        tokens: '0',
        delegatorShares: '0',
        moniker: validator.moniker,
        identity: '',
        website: '',
        securityContact: '',
        details: '',
        unbondingHeight: '0',
        unbondingTime: new Date(0),
        updateTime: new Date(),
        rate: '0',
        maxRate: '0',
        maxChangeRate: '0',
        minSelfDelegation: '0',
        missedBlocks: null,
        outstandingRewards: null,
        outstandingCommissions: null,
        delegatorsAmount: 0,
        consensusAddress: '',
        uptime: null,
        inCommittee: false,
        committeeEpoch: null,
        validator: {
          url: validator.url,
          moniker: validator.moniker,
        },
        chain: {
          name: chainName,
          tokenomics: chainInfo?.tokenomics || null,
          params: chainInfo?.params || null,
        },
        votingPower: 0,
        totalSlots: null,
      } as NetworkValidatorsWithNodes;
    }

    const firstNode = nodes[0];
    const totalTokens = nodes.reduce((sum, node) => sum + BigInt(node.tokens), BigInt(0));
    const totalDelegatorShares = nodes.reduce((sum, node) => sum + parseFloat(node.delegatorShares), 0);
    const nodesWithMissedBlocks = nodes.filter((node) => node.missedBlocks !== null && node.missedBlocks !== undefined);
    const totalMissedBlocks =
      nodesWithMissedBlocks.length > 0
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

    const nodesWithUptime = nodes.filter((node) => node.uptime !== null && node.uptime !== undefined);
    const avgUptime =
      nodesWithUptime.length > 0 ? nodesWithUptime.reduce((sum, node) => sum + node.uptime!, 0) / nodesWithUptime.length : null;

    const isJailed = nodes.some((node) => node.jailed);
    const votingPower = bondedTokens !== 0 ? (totalDelegatorShares / bondedTokens) * 100 : 0;

    let totalSlots: number | null = null;
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
    } as NetworkValidatorsWithNodes;
  });

  aggregatedValidators.sort((a, b) => {
    const aHasNodes = parseFloat(a.tokens) > 0;
    const bHasNodes = parseFloat(b.tokens) > 0;
    if (aHasNodes !== bHasNodes) {
      return aHasNodes ? -1 : 1;
    }

    if (a.jailed !== b.jailed) {
      return a.jailed ? 1 : -1;
    }

    let aVal: any;
    let bVal: any;

    if (sortBy === 'votingPower') {
      aVal = a.votingPower;
      bVal = b.votingPower;
    } else if (sortBy === 'tokens' || sortBy === 'delegatorShares') {
      aVal = parseFloat((a as any)[sortBy] || '0');
      bVal = parseFloat((b as any)[sortBy] || '0');
    } else if (sortBy === 'missedBlocks' || sortBy === 'delegatorsAmount') {
      aVal = (a as any)[sortBy] || 0;
      bVal = (b as any)[sortBy] || 0;
    } else if (sortBy === 'uptime') {
      aVal = a.uptime || 0;
      bVal = b.uptime || 0;
    } else if (sortBy === 'moniker') {
      aVal = a.moniker || '';
      bVal = b.moniker || '';
    } else {
      aVal = (a as any)[sortBy] || '';
      bVal = (b as any)[sortBy] || '';
    }

    if (typeof aVal === 'string') {
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const totalCount = aggregatedValidators.length;
  const pages = Math.ceil(totalCount / take);
  const paginated = aggregatedValidators.slice(skip, skip + take);

  return { validators: paginated, pages };
};

const getChainValidatorsWithNodes = async (
  id: number,
  nodeStatus: string[],
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
): Promise<{ validators: NetworkValidatorsWithNodes[]; pages: number }> => {
  const chainInfo = await db.chain.findUnique({
    where: { id },
    select: {
      name: true,
      tokenomics: { select: { bondedTokens: true } },
      params: { select: { coinDecimals: true, blocksWindow: true } },
    },
  });

  const chainName = chainInfo?.name;
  const isAztecChain = chainName && ['aztec', 'aztec-testnet'].includes(chainName);

  if (isAztecChain) {
    return getAztecValidatorsWithNodes(id, chainInfo, nodeStatus, skip, take, sortBy, order);
  }

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

const getCommitteeMembers = async (
  chainId: number,
  sortBy: string = 'validator',
  order: SortDirection = 'asc',
  skip: number,
  take: number,
): Promise<{ members: CommitteeMember[]; pages: number }> => {
  const orderBy =
    sortBy === 'validator'
      ? { validator: { moniker: order } }
      : sortBy === 'address'
        ? { operatorAddress: order }
        : sortBy === 'rewardAddress'
          ? { rewardAddress: order }
          : { validator: { moniker: order } };

  const where = {
    chainId,
    inCommittee: true,
  };

  if (skip !== undefined && take !== undefined) {
    const nodes = await db.node.findMany({
      where,
      select: {
        operatorAddress: true,
        rewardAddress: true,
        moniker: true,
        tokens: true,
        validator: {
          select: {
            id: true,
            url: true,
            moniker: true,
          },
        },
        chain: {
          select: {
            params: {
              select: {
                coinDecimals: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take,
    });

    const count = await db.node.count({ where });
    const pages = take ? Math.ceil(count / take) : 1;

    return { members: nodes, pages };
  } else {
    return { members: [], pages: 0 };
  }
};

const ChainService = {
  getAll,
  getTokenPriceByChainId,
  getById,
  getChainValidatorsWithNodes,
  getListByEcosystem,
  getByName,
  getAllLight,
  getCommitteeMembers,
};

export default ChainService;
