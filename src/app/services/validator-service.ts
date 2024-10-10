import { Node, Validator } from '@prisma/client';

import db from '@/db';

export type ValidatorWithNodes = Validator & {
  nodes: Node[];
};

const getAll = async (skip: number, take: number): Promise<{ validators: ValidatorWithNodes[]; pages: number }> => {
  const validators = (await db.validator.findMany({
    skip: skip,
    take: take,
    include: { nodes: true },
  })) as ValidatorWithNodes[];

  const count = await db.validator.count();

  return { validators, pages: Math.ceil(count / take) };
};

const ValidatorService = {
  getAll,
};

export default ValidatorService;
