import { Ecosystem } from '@prisma/client';
import db from '@/db';
import logger from '@/logger';

const { logDebug } = logger('ecosystem-service');

const getAll = async (): Promise<Ecosystem[]> => {
  logDebug('Get ecosystems');
  return db.ecosystem.findMany({
    orderBy: { name: 'asc' },
  });
};

const getAllTags = async (): Promise<string[]> => {
  logDebug('Get all ecosystem tags');
  const ecosystems = await db.ecosystem.findMany({
    select: { tags: true },
  });
  const allTags = ecosystems.flatMap((e) => e.tags);
  return Array.from(new Set(allTags)).sort();
};

const ecosystemService = {
  getAll,
  getAllTags,
};

export default ecosystemService;
