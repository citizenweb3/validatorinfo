import { Chain, Node, Prisma, Validator } from '@prisma/client';

import { DropdownListItem } from '@/app/stakingcalculator/choose-dropdown';
import db from '@/db';
import logger from '@/logger';
import { SortDirection } from '@/server/types';

const { logDebug } = logger('validator-service');

export type ValidatorWithNodes = Validator & {
  nodes: Node[];
};

export type validatorNodesWithChainData = Node & {
  chain: Chain;
  votingPower: number;
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

const getValidatorNodesWithChains = async (
  id: number,
  ecosystems: string[] = [],
  nodeStatus: string[] = [],
  sortBy: string = 'prettyName',
  order: SortDirection = 'asc',
): Promise<{ validatorNodesWithChainData: validatorNodesWithChainData[] }> => {
  logDebug(`Get validator nodes with chain data: ${id}, sortBy: ${sortBy} - ${order}`);

  const validator = await db.validator.findUnique({
    where: { id },
    include: { nodes: { include: { chain: true } } },
  });

  if (!validator) return { validatorNodesWithChainData: [] };

  let filteredNodes = validator.nodes;

  if (ecosystems.length > 0) {
    filteredNodes = filteredNodes.filter((node) => {
      return node.chain?.ecosystem && ecosystems.includes(node.chain.ecosystem);
    });
  }

  if (nodeStatus && nodeStatus.length > 0 && !nodeStatus.includes('all')) {
    const jailedSelected = nodeStatus.includes('jailed');
    const unjailedSelected = nodeStatus.includes('unjailed');
    if (jailedSelected && !unjailedSelected) {
      filteredNodes = filteredNodes.filter((node) => node.jailed === true);
    } else if (unjailedSelected && !jailedSelected) {
      filteredNodes = filteredNodes.filter((node) => node.jailed === false);
    }
  }

  const nodesWithComputed = filteredNodes.map((node) => {
    const bondedTokens = parseFloat(node.chain?.bondedTokens || '0');
    const delegatorShares = parseFloat(node.delegatorShares || '0');
    const votingPower = bondedTokens !== 0 ? (delegatorShares / bondedTokens) * 100 : 0;
    return {
      ...node,
      votingPower,
    };
  });

  const sortedNodes = nodesWithComputed.sort((a, b) => {
    let aValue, bValue;
    if (sortBy === 'prettyName') {
      aValue = a.chain?.prettyName || '';
      bValue = b.chain?.prettyName || '';
      return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else if (sortBy === 'apr') {
      aValue = a.chain?.apr || 0;
      bValue = b.chain?.apr || 0;
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    } else if (sortBy === 'votingPower') {
      aValue = a.votingPower;
      bValue = b.votingPower;
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    } else if (sortBy === 'delegatorShares' || sortBy === 'rate' || sortBy === 'minSelfDelegation') {
      aValue = parseFloat(a[sortBy] || '0');
      bValue = parseFloat(b[sortBy] || '0');
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      return 0;
    }
  });

  return {
    validatorNodesWithChainData: sortedNodes,
  };
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
};

export default validatorService;
