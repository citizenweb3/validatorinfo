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

const ecosystemService = {
  getAll,
};

export default ecosystemService;
