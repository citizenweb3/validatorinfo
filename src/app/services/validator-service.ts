import { Node, NodesConsensusData, Prisma, Validator } from '@prisma/client';

import { DropdownListItem } from '@/app/stakingcalculator/choose-dropdown';
import db from '@/db';
import logger from '@/logger';
import { SortDirection } from '@/server/types';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

const { logDebug } = logger('validator-service');

export type ValidatorWithNodes = Validator & {
  nodes: Node[];
};

export type validatorNodesWithChainData = Node & {
  chain: ChainWithParamsAndTokenomics;
  votingPower: number;
  consensusData: NodesConsensusData | null;
};

const getById = async (id: number): Promise<Validator | null> => {
  logDebug(`Get validator by id: ${id}`);
  return db.validator.findUnique({
    where: { id },
  });
};

const getByIdentity = async (identity: string): Promise<Validator | null> => {
  logDebug(`Get validator by identity: ${identity}`);
  return db.validator.findUnique({
    where: { identity },
  });
};

const upsertValidator = async (
  identity: string,
  desc: {
    moniker: string;
    website: string;
    securityContact: string;
    details: string;
    url?: string;
  },
): Promise<Validator> => {
  logDebug(`Upsert validator: ${identity}`);

  let website = desc.website || '';
  if (website) {
    website = website.startsWith('http') ? website : `https://${website}`;
  }

  if (desc.url) {
    desc.url = desc.url?.startsWith('http') ? desc.url : `https://${desc.url}`;
  }

  return db.validator.upsert({
    where: { identity },
    update: { ...desc, website },
    create: { ...desc, website, identity },
  });
};

const getAll = async (
  ecosystems: string[],
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
): Promise<{ validators: ValidatorWithNodes[]; pages: number }> => {
  logDebug(
    `Get all validators with nodes ecosystems: ${ecosystems}, skip: ${skip}, take: ${take}, sortBy: ${sortBy} - ${order}`,
  );
  const where = ecosystems.length
    ? {
        nodes: {
          some: {
            chain: {
              ecosystem: {
                in: ecosystems,
              },
            },
          },
        },
      }
    : undefined;
  const validators = (await db.validator.findMany({
    where,
    skip: skip,
    take: take,
    orderBy:
      sortBy === 'moniker'
        ? { moniker: order }
        : {
            nodes: {
              _count: order,
            },
          },
  })) as Validator[];

  const validatorsWithNodes = (await db.validator.findMany({
    where: { id: { in: validators.map((v) => v.id) } },
    include: {
      nodes: { include: { chain: true } },
    },
    orderBy:
      sortBy === 'moniker'
        ? { moniker: order }
        : {
            nodes: {
              _count: order,
            },
          },
  })) as ValidatorWithNodes[];

  const count = await db.validator.count({ where });

  return { validators: validatorsWithNodes, pages: Math.ceil(count / take) };
};

const getLite = async (
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
): Promise<{ validators: ValidatorWithNodes[]; pages: number }> => {
  logDebug(`Get lite validators skip: ${skip}, take: ${take}, sortBy: ${sortBy} - ${order}`);

  const validators = (await db.validator.findMany({
    skip: skip,
    take: take,
    select: { id: true, moniker: true, url: true, identity: true, twitter: true, github: true, website: true },
    orderBy: { [sortBy]: order },
  })) as ValidatorWithNodes[];

  const count = await db.validator.count();

  return { validators, pages: Math.ceil(count / take) };
};

const getList = async (): Promise<DropdownListItem[]> => {
  logDebug('Get validator list');

  return (
    await db.validator.findMany({
      select: { moniker: true, id: true },
      orderBy: { moniker: 'asc' },
    })
  ).map((e) => ({ title: e.moniker, value: e.id })) as DropdownListItem[];
};

const getValidatorByIdentity = async (identity: string): Promise<Validator | null> => {
  return db.validator.findUnique({
    where: { identity },
  });
};

const safeParseFloat = (value: string | null | undefined): number => {
  const parsed = parseFloat(value || '0');
  return isNaN(parsed) ? 0 : parsed;
};

const computeVotingPower = (node: { delegatorShares: string; chain: { tokenomics: { bondedTokens: string } | null } }): number => {
  const bondedTokens = safeParseFloat(node.chain?.tokenomics?.bondedTokens);
  const delegatorShares = safeParseFloat(node.delegatorShares);
  return bondedTokens === 0 ? 0 : (delegatorShares / bondedTokens) * 100;
};

const aggregateNodesByChain = (
  nodes: validatorNodesWithChainData[],
): validatorNodesWithChainData[] => {
  const chainGroups = new Map<number, validatorNodesWithChainData[]>();

  for (const node of nodes) {
    const group = chainGroups.get(node.chainId) || [];
    group.push(node);
    chainGroups.set(node.chainId, group);
  }

  return Array.from(chainGroups.values()).map((group) => {
    // Find primary node: max delegatorShares + tokens
    const primaryNode = group.reduce((best, node) => {
      const bestScore = safeParseFloat(best.delegatorShares) + safeParseFloat(best.tokens);
      const nodeScore = safeParseFloat(node.delegatorShares) + safeParseFloat(node.tokens);
      return nodeScore > bestScore ? node : best;
    });

    if (group.length === 1) {
      return primaryNode;
    }

    // Sum numeric metrics across all nodes in the group
    const totalTokens = group.reduce((sum, n) => sum + safeParseFloat(n.tokens), 0);
    const totalDelegatorShares = group.reduce((sum, n) => sum + safeParseFloat(n.delegatorShares), 0);
    const totalDelegators = group.reduce((sum, n) => sum + (n.delegatorsAmount || 0), 0);
    const totalSelfDelegation = group.reduce((sum, n) => sum + safeParseFloat(n.minSelfDelegation), 0);
    const totalVotingPower = group.reduce((sum, n) => sum + n.votingPower, 0);

    return {
      ...primaryNode,
      tokens: totalTokens.toString(),
      delegatorShares: totalDelegatorShares.toString(),
      delegatorsAmount: totalDelegators,
      minSelfDelegation: totalSelfDelegation.toString(),
      votingPower: totalVotingPower,
    };
  });
};

const getValidatorNodesWithChains = async (
  id: number,
  ecosystems: string[] = [],
  nodeStatus: string[] = [],
  skip: number = 0,
  take: number = Number.MAX_SAFE_INTEGER,
  sortBy: string = 'prettyName',
  order: SortDirection = 'asc',
  aggregated: boolean = false,
  chainFilters: string[] = [],
): Promise<{
  validatorNodesWithChainData: validatorNodesWithChainData[];
  pages: number;
}> => {
  logDebug(`Get validator nodes with chains: id=${id}, aggregated=${aggregated}, chainFilters=${JSON.stringify(chainFilters)}`);
  const where: any = { validatorId: id, NOT: { tokens: '0' } };
  if (ecosystems.length > 0) {
    where.chain = { ecosystem: { in: ecosystems } };
  }
  if (nodeStatus && nodeStatus.length > 0 && !nodeStatus.includes('all')) {
    if (nodeStatus.includes('jailed') && !nodeStatus.includes('unjailed')) {
      where.jailed = true;
    } else if (nodeStatus.includes('unjailed') && !nodeStatus.includes('jailed')) {
      where.jailed = false;
    }
  }

  if (chainFilters.length > 0) {
    where.chain = { ...where.chain, name: { in: chainFilters } };
  }

  if (sortBy === 'votingPower') {
    const allNodes = await db.node.findMany({
      where,
      include: {
        chain: {
          include: {
            tokenomics: true,
            params: true,
          },
        },
        consensusData: true,
      },
    });

    const computedNodes = allNodes.map((node) => {
      const votingPower = computeVotingPower(node);
      return { ...node, votingPower };
    });

    const finalNodes = aggregated ? aggregateNodesByChain(computedNodes) : computedNodes;
    finalNodes.sort((a, b) => (order === 'asc' ? a.votingPower - b.votingPower : b.votingPower - a.votingPower));

    const totalCount = finalNodes.length;
    const pages = Math.ceil(totalCount / take);
    const paginatedNodes = finalNodes.slice(skip, skip + take);

    return { validatorNodesWithChainData: paginatedNodes, pages };
  } else {
    let orderBy;
    if (sortBy === 'prettyName') {
      orderBy = [{ chain: { prettyName: order } }];
    } else if (sortBy === 'apr') {
      orderBy = [{ chain: { tokenomics: { apr: order } } }];
    } else if (['delegatorShares', 'rate', 'minSelfDelegation', 'rank'].includes(sortBy)) {
      orderBy = [{ [sortBy]: order }];
    } else {
      orderBy = [{ id: order }];
    }

    if (aggregated) {
      // Fetch all nodes (no pagination at DB level), aggregate, then paginate
      const allNodes = await db.node.findMany({
        where,
        orderBy,
        include: {
          chain: { include: { tokenomics: true, params: true } },
          consensusData: true,
        },
      });

      const allComputedNodes = allNodes.map((node) => {
        const votingPower = computeVotingPower(node);
        return { ...node, votingPower };
      });

      const aggregatedNodes = aggregateNodesByChain(allComputedNodes);

      // Re-sort aggregated results
      if (sortBy === 'prettyName') {
        aggregatedNodes.sort((a, b) => {
          const nameA = a.chain.prettyName.toLowerCase();
          const nameB = b.chain.prettyName.toLowerCase();
          return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
      } else if (sortBy === 'apr') {
        aggregatedNodes.sort((a, b) => {
          const aprA = safeParseFloat(String(a.chain?.tokenomics?.apr ?? '0'));
          const aprB = safeParseFloat(String(b.chain?.tokenomics?.apr ?? '0'));
          return order === 'asc' ? aprA - aprB : aprB - aprA;
        });
      } else if (['delegatorShares', 'rate', 'minSelfDelegation', 'rank'].includes(sortBy)) {
        aggregatedNodes.sort((a, b) => {
          const rawA = (a as Record<string, unknown>)[sortBy];
          const rawB = (b as Record<string, unknown>)[sortBy];
          const valA = rawA != null ? safeParseFloat(String(rawA)) : 0;
          const valB = rawB != null ? safeParseFloat(String(rawB)) : 0;
          return order === 'asc' ? valA - valB : valB - valA;
        });
      }

      const totalCount = aggregatedNodes.length;
      const pages = Math.ceil(totalCount / take);
      const paginatedNodes = aggregatedNodes.slice(skip, skip + take);

      return { validatorNodesWithChainData: paginatedNodes, pages };
    } else {
      // Non-aggregated: existing logic with DB-level pagination
      const totalCount = await db.node.count({ where });
      const pages = Math.ceil(totalCount / take);

      const nodes = await db.node.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          chain: { include: { tokenomics: true, params: true } },
          consensusData: true,
        },
      });

      const computedNodes = nodes.map((node) => {
        const votingPower = computeVotingPower(node);
        return { ...node, votingPower };
      });

      return { validatorNodesWithChainData: computedNodes, pages };
    }
  }
};

const getRandom = async (ecosystems: string[], take: number): Promise<{ validators: ValidatorWithNodes[] }> => {
  logDebug(`Get random validators ecosystems: ${ecosystems}, take: ${take}`);

  const sql = Prisma.sql`
      SELECT v.id, COALESCE(json_agg(n.*) FILTER(WHERE n.id IS NOT NULL), '[]'::json) AS nodes
      FROM "validators" v
               LEFT JOIN "nodes" n ON v.id = n.validator_id
          ${
            ecosystems.length
              ? Prisma.sql`
      LEFT JOIN "chains" c ON n.chain_id = c.id
      WHERE c.ecosystem IN (${Prisma.join(ecosystems)})`
              : Prisma.sql``
          }
      GROUP BY v.id
      ORDER BY RANDOM()
          LIMIT ${Prisma.raw(`${take}`)}
  `;

  const validatorIds = await db.$queryRaw<{ id: number }[]>(sql);

  const validators = (await db.validator.findMany({
    where: { id: { in: validatorIds.map((v) => v.id) } },
    include: {
      nodes: { include: { chain: true } },
    },
  })) as ValidatorWithNodes[];

  return { validators };
};

const getByIdentityWithDetails = async (identity: string) => {
  return db.validator.findUnique({
    where: { identity },
    select: {
      id: true,
      identity: true,
      moniker: true,
      nodes: {
        select: {
          operatorAddress: true,
          jailed: true,
          delegatorShares: true,
          moniker: true,
          identity: true,
          rate: true,
          outstandingRewards: true,
          delegatorsAmount: true,
          missedBlocks: true,
          uptime: true,
          rank: true,
          chain: {
            select: {
              id: true,
              chainId: true,
              name: true,
              prettyName: true,
              params: {
                select: {
                  denom: true,
                  minimalDenom: true,
                  coinDecimals: true,
                },
              },
              prices: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { value: true, createdAt: true },
              },
              tokenomics: {
                select: {
                  apr: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getActiveValidatorsByChainId = async (chainId: number): Promise<ValidatorWithNodes[]> => {
  logDebug(`Get active validators by chainId: ${chainId}`);

  const validators = await db.validator.findMany({
    where: {
      nodes: {
        some: {
          chainId,
          jailed: false,
        },
      },
    },
    include: {
      nodes: {
        where: { chainId },
        include: { chain: true },
      },
    },
    orderBy: { moniker: 'asc' },
  });

  return validators.filter((validator) =>
    validator.nodes.some(
      (node) =>
        (node.tokens != null && node.tokens !== '0' && node.tokens !== '') ||
        (node.delegatorShares != null && node.delegatorShares !== '0' && node.delegatorShares !== ''),
    ),
  ) as ValidatorWithNodes[];
};

const getValidatorsByChainId = async (chainId: number): Promise<ValidatorWithNodes[]> => {
  logDebug(`Get validators by chainId: ${chainId}`);
  return db.validator.findMany({
    where: {
      nodes: {
        some: {
          chainId,
        },
      },
    },
    include: {
      nodes: {
        where: { chainId },
        include: { chain: true },
      },
    },
    orderBy: { moniker: 'asc' },
  });
};

const getAztecValidators = async (chainName: 'aztec' | 'aztec-testnet', chainId: number): Promise<ValidatorWithNodes[]> => {
  logDebug(`Get Aztec validators by providerAddresses for chain: ${chainName}`);

  const allValidators = await db.validator.findMany({
    include: {
      nodes: {
        where: { chainId },
        include: { chain: true },
      },
    },
    orderBy: { moniker: 'asc' },
  });

  return allValidators.filter((v) => {
    const addresses = v.providerAddresses as Record<string, string> | null;
    return addresses && addresses[chainName];
  }) as ValidatorWithNodes[];
};

const searchByMoniker = async (query: string, take: number = 10) => {
  return db.validator.findMany({
    where: {
      moniker: { contains: query, mode: 'insensitive' },
    },
    take,
    select: {
      id: true,
      identity: true,
      moniker: true,
      website: true,
      nodes: {
        select: {
          chain: {
            select: {
              name: true,
              prettyName: true,
              params: { select: { denom: true, coinDecimals: true } },
              tokenomics: { select: { apr: true } },
              prices: { orderBy: { createdAt: 'desc' }, take: 1, select: { value: true } },
            },
          },
          operatorAddress: true,
          jailed: true,
          rate: true,
          uptime: true,
          missedBlocks: true,
          tokens: true,
          delegatorsAmount: true,
        },
      },
    },
    orderBy: { moniker: 'asc' },
  });
};

const validatorService = {
  getByIdentity,
  getById,
  getAll,
  getLite,
  getList,
  getValidatorByIdentity,
  getValidatorNodesWithChains,
  upsertValidator,
  getRandom,
  getByIdentityWithDetails,
  getActiveValidatorsByChainId,
  getValidatorsByChainId,
  getAztecValidators,
  searchByMoniker,
};

export default validatorService;
