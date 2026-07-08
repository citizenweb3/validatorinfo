import { getBaseUrl, healthCheck } from './client';
import {
  getBlockByHeight,
  getBlocksList,
  getBlocksStats,
  getDelegations,
  getGovVotes,
  getTxByHash,
  getTxRaw,
  getTxsByAddress,
  getTxsList,
  getTxsStats,
} from './endpoints';

export * from './types';

export const atomoneIndexer = {
  getBlocksList,
  getBlockByHeight,
  getBlocksStats,
  getTxsList,
  getTxByHash,
  getTxRaw,
  getTxsStats,
  getGovVotes,
  getTxsByAddress,
  getDelegations,
  healthCheck,
  getBaseUrl,
};

export default atomoneIndexer;
