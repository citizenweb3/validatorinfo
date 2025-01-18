import { Node, Validator, Chain } from '@prisma/client';

import { DropdownListItem } from '@/app/staking_calculator/choose-dropdown';
import db from '@/db';

export type SortDirection = 'asc' | 'desc';

export type ValidatorWithNodes = Validator & {
  nodes: Node[];
};

export type validatorNodesWithChainData = Node & {
  prettyName: string | null;
  logoUrl: string | null;
  coinDecimals: number;
};

const getAll = async (
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
): Promise<{ validators: ValidatorWithNodes[]; pages: number }> => {
  const validators = (await db.validator.findMany({
    skip: skip,
    take: take,
    include: { nodes: true },
    orderBy:
      sortBy === 'moniker'
        ? { moniker: order }
        : {
            nodes: {
              _count: order, // Sort by the number of nodes
            },
          },
  })) as ValidatorWithNodes[];
  const count = await db.validator.count();

  return { validators, pages: Math.ceil(count / take) };
};

const getLite = async (
  skip: number,
  take: number,
  sortBy: string = 'moniker',
  order: SortDirection = 'asc',
): Promise<{ validators: ValidatorWithNodes[]; pages: number }> => {
  const validators = (await db.validator.findMany({
    skip: skip,
    take: take,
    select: { moniker: true, url: true, identity: true },
    orderBy: { [sortBy]: order },
  })) as ValidatorWithNodes[];

  const count = await db.validator.count();

  return { validators, pages: Math.ceil(count / take) };
};

const getList = async (): Promise<DropdownListItem[]> => {
  return (
    await db.validator.findMany({
      select: { moniker: true, identity: true },
      orderBy: { moniker: 'asc' },
    })
  ).map((e) => ({ title: e.moniker, value: e.identity })) as DropdownListItem[];
};

const getValidatorByIdentity = async (identity: string): Promise<Validator | null> => {
  return db.validator.findUnique({
    where: { identity },
  });
};

const getValidatorNodesWithChains = async (
  identity: string,
  sortBy: string = 'prettyName',
  order: SortDirection = 'asc',
): Promise<{ validatorNodesWithChainData: validatorNodesWithChainData[] }> => {

  const validator = await db.validator.findUnique({
    where: { identity },
    include: { nodes: true },
  });
  if (!validator) return {validatorNodesWithChainData: []};

  const allChainIds = validator.nodes.map((node) => node.chainId);
  const allChains = await db.chain.findMany({
    where: {
      chainId: { in: allChainIds },
    },
  });

  const chainMap = allChains.reduce(
    (map, chain) => {
      map[chain.chainId] = {
        logoUrl: chain.logoUrl,
        prettyName: chain.prettyName,
        coinDecimals: chain.coinDecimals,
      };
      return map;
    },
    {} as Record<string, { logoUrl: string; prettyName: string; coinDecimals: number }>,
  );

  const mergedNodes = validator.nodes.map((node) => ({
    ...node,
    logoUrl: chainMap[node.chainId]?.logoUrl || null,
    prettyName: chainMap[node.chainId]?.prettyName || null,
    coinDecimals: chainMap[node.chainId]?.coinDecimals || 6,
  }));

  const sortedNodes = mergedNodes.sort((a, b) => {
    let aValue, bValue;
    if (sortBy === 'prettyName') {
      aValue = a.prettyName || '';
      bValue = b.prettyName || '';
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (sortBy === 'delegator_shares' || sortBy === 'rate' || sortBy === 'min_self_delegation') {
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

const ValidatorService = {
  getAll,
  getLite,
  getList,
  getValidatorByIdentity,
  getValidatorNodesWithChains,
};

export default ValidatorService;
