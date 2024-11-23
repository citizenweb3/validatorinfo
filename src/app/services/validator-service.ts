import { Node, Validator } from '@prisma/client';

import { DropdownListItem } from '@/app/staking_calculator/choose-dropdown';
import db from '@/db';

export type SortDirection = 'asc' | 'desc';

export type ValidatorWithNodes = Validator & {
  nodes: Node[];
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

const ValidatorService = {
  getAll,
  getLite,
  getList,
};

export default ValidatorService;
