import { getBaseUrl, healthCheck } from './client';
import { getBlock, getBlocks, getStats } from './endpoints';

export * from './types';

export const logosIndexer = {
  getStats,
  getBlocks,
  getBlock,
  healthCheck,
  getBaseUrl,
};

export default logosIndexer;
