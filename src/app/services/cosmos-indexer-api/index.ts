import { getBaseUrl, healthCheck } from './client';
import {
  getBlockByHeight,
  getBlocksList,
  getBlocksStats,
  getGovVotes,
  getTxByHash,
  getTxRaw,
  getTxsList,
  getTxsStats,
} from './endpoints';

export * from './types';

export const cosmosIndexer = {
  getBlocksList,
  getBlockByHeight,
  getBlocksStats,
  getTxsList,
  getTxByHash,
  getTxRaw,
  getTxsStats,
  getGovVotes,
  healthCheck,
  getBaseUrl,
};

export default cosmosIndexer;
