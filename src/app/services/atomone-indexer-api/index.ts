import { getBaseUrl, healthCheck } from './client';
import {
  getBlockByHeight,
  getBlocksList,
  getBlocksStats,
  getTxByHash,
  getTxRaw,
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
  healthCheck,
  getBaseUrl,
};

export default atomoneIndexer;
