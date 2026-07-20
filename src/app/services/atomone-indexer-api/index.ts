import { getBaseUrl, healthCheck } from './client';
import {
  getBlockByHeight,
  getBlocksList,
  getBlocksStats,
  getCoverage,
  getDelegations,
  getEarliestActivity,
  getGovVotes,
  getStakingDeltas,
  getTxByHash,
  getTxRaw,
  getTransfersByAddress,
  getTxsByAddress,
  getTxsList,
  getTxsStats,
} from './endpoints';

export * from './types';

export const atomoneIndexer = {
  getBlocksList,
  getBlockByHeight,
  getBlocksStats,
  getCoverage,
  getTxsList,
  getTxByHash,
  getTxRaw,
  getTxsStats,
  getGovVotes,
  getTransfersByAddress,
  getTxsByAddress,
  getDelegations,
  getEarliestActivity,
  getStakingDeltas,
  healthCheck,
  getBaseUrl,
};

export default atomoneIndexer;
