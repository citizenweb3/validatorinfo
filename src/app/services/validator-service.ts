import { Node, Validator } from '@prisma/client';

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

const ValidatorService = {
  getAll,
  getLite,
};

export default ValidatorService;
