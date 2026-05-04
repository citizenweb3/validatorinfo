import { getBaseUrl, healthCheck } from './client';
import { getBlock, getBlocks, getStats, getTransaction, getTransactions } from './endpoints';

export * from './types';

export const logosIndexer = {
  getStats,
  getBlocks,
  getBlock,
  getTransactions,
  getTransaction,
  healthCheck,
  getBaseUrl,
};

export default logosIndexer;
