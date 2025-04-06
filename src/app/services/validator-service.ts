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
  skip: number = 0,
  take: number = Number.MAX_SAFE_INTEGER,
  sortBy: string = 'prettyName',
  order: SortDirection = 'asc',
): Promise<{
  validatorNodesWithChainData: validatorNodesWithChainData[];
  pages: number;
}> => {
  const where: any = { validatorId: id };
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

  if (sortBy === 'votingPower') {
    const allNodes = await db.node.findMany({
      where,
      include: { chain: true },
    });
    const computedNodes = allNodes.map((node) => {
      const bondedTokens = parseFloat(node.chain?.bondedTokens || '0');
      const delegatorShares = parseFloat(node.delegatorShares || '0');
      const votingPower = bondedTokens !== 0 ? (delegatorShares / bondedTokens) * 100 : 0;
      return { ...node, votingPower };
    });

    computedNodes.sort((a, b) => order === 'asc'
      ? a.votingPower - b.votingPower
      : b.votingPower - a.votingPower);

    const totalCount = computedNodes.length;
    const pages = Math.ceil(totalCount / take);
    const paginatedNodes = computedNodes.slice(skip, skip + take);

    return { validatorNodesWithChainData: paginatedNodes, pages };

  } else {
    const totalCount = await db.node.count({ where });
    const pages = Math.ceil(totalCount / take);

    let orderBy;
    if (sortBy === 'prettyName') {
      orderBy = [{ chain: { prettyName: order } }];
    } else if (sortBy === 'apr') {
      orderBy = [{ chain: { apr: order } }];
    } else if (['delegatorShares', 'rate', 'minSelfDelegation'].includes(sortBy)) {
      orderBy = [{ [sortBy]: order }];
    } else {
      orderBy = [{ id: order }];
    }

    const nodes = await db.node.findMany({
      where,
      skip,
      take,
      orderBy: orderBy,
      include: { chain: true },
    });

    const computedNodes = nodes.map((node) => {
      const bondedTokens = parseFloat(node.chain?.bondedTokens || '0');
      const delegatorShares = parseFloat(node.delegatorShares || '0');
      const votingPower = bondedTokens !== 0 ? (delegatorShares / bondedTokens) * 100 : 0;
      return { ...node, votingPower };
    });

    return { validatorNodesWithChainData: computedNodes, pages };
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
