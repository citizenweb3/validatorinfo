import { getBaseUrl, healthCheck } from './client';
import {
  getBlockByHeight,
  getBlocksList,
  getBlocksStats,
  getGovVotes,
  getTxByHash,
  getTxRaw,
  getTxsByAddress,
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
  getTxsByAddress,
  healthCheck,
  getBaseUrl,
};

export default cosmosIndexer;
