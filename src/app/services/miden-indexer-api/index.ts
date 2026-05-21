import { getBaseUrl, healthCheck } from './client';
import { getBlock, getBlocks, getStats, getTransaction, getTransactions } from './endpoints';

export * from './types';
export { HttpError } from './client';

export const midenIndexer = {
  getStats,
  getBlocks,
  getBlock,
  getTransactions,
  getTransaction,
  healthCheck,
  getBaseUrl,
};

export default midenIndexer;
