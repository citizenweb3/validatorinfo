import * as endpoints from './endpoints';

export type {
  // Hex string type
  HexString,
  // Response types
  LatestHeightResponse,
  AztecBlock,
  AztecTxEffect,
  AztecPendingTx,
  AztecDroppedTx,
  AztecContractClass,
  AztecContractInstance,
  AztecNetworkInfo,
  AztecNetworkErrors,
  AztecSearchResult,
  AztecPublicLogsSearchResult,
  TotalTxEffectsResponse,
  TxEffectsLast24hResponse,
  TotalContractsResponse,
  TotalContractsLast24hResponse,
  AverageFeeResponse,
  AverageBlockTimeResponse,
  // Block structure types
  TreeState,
  BufferData,
  ContentCommitment,
  PartialState,
  BlockState,
  GasFees,
  GlobalVariables,
  BlockHeader,
  BlockBody,
  // Query param types
  BlocksQueryParams,
  TxEffectsQueryParams,
  PendingTxsQueryParams,
  SearchQueryParams,
  PublicLogsSearchParams,
  // Request options
  AztecIndexerRequestOptions,
  AztecIndexerErrorResponse,
} from './types';

export { get, post, healthCheck, getBaseUrl, buildQueryString, buildUrl } from './client';
export type { QueryParams } from './client';

export const aztecIndexer = {
  // ========== BLOCKS ==========
  /** Get latest block height */
  getLatestHeight: endpoints.getLatestHeight,
  /** Get latest block details */
  getLatestBlock: endpoints.getLatestBlock,
  /** Get list of blocks with pagination */
  getBlocks: endpoints.getBlocks,
  /** Get block by height */
  getBlockByHeight: endpoints.getBlockByHeight,
  /** Get block by hash */
  getBlockByHash: endpoints.getBlockByHash,

  // ========== CONTRACTS ==========
  /** Get all contract classes */
  getContractClasses: endpoints.getContractClasses,
  /** Get all contract instances */
  getContractInstances: endpoints.getContractInstances,
  /** Get specific contract instance by address */
  getContractInstance: endpoints.getContractInstance,

  // ========== NETWORK ==========
  /** Get L2 network information */
  getInfo: endpoints.getInfo,
  /** Get network errors */
  getErrors: endpoints.getErrors,

  // ========== SEARCH ==========
  /** Search by hash, height, or address */
  search: endpoints.search,
  /** Search transactions by public logs */
  searchPublicLogs: endpoints.searchPublicLogs,

  // ========== TX EFFECTS ==========
  /** Get all tx effects with pagination */
  getTxEffects: endpoints.getTxEffects,
  /** Get all tx effects for a specific block */
  getBlockTxEffects: endpoints.getBlockTxEffects,
  /** Get specific tx effect by index in block */
  getBlockTxEffectByIndex: endpoints.getBlockTxEffectByIndex,
  /** Get tx effect by hash */
  getTxEffectByHash: endpoints.getTxEffectByHash,

  // ========== PENDING TRANSACTIONS ==========
  /** Get pending transactions (mempool) */
  getPendingTxs: endpoints.getPendingTxs,
  /** Get specific pending transaction by hash */
  getPendingTx: endpoints.getPendingTx,
  /** Get dropped transaction by hash */
  getDroppedTx: endpoints.getDroppedTx,

  // ========== STATISTICS ==========
  /** Get total number of tx effects (all-time) */
  getTotalTxEffects: endpoints.getTotalTxEffects,
  /** Get number of tx effects in last 24 hours */
  getTxEffectsLast24h: endpoints.getTxEffectsLast24h,
  /** Get total number of contracts (all-time) */
  getTotalContracts: endpoints.getTotalContracts,
  /** Get number of contracts deployed in last 24 hours */
  getTotalContractsLast24h: endpoints.getTotalContractsLast24h,
  /** Get average transaction fees */
  getAverageFees: endpoints.getAverageFees,
  /** Get average block time */
  getAverageBlockTime: endpoints.getAverageBlockTime,
};

// Export as default for convenience
export default aztecIndexer;
