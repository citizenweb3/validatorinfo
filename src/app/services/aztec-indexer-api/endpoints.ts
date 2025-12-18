import logger from '@/logger';

import * as client from './client';
import {
  AverageBlockTimeResponse,
  AverageFeeResponse,
  AztecBlock,
  AztecContractClass,
  AztecContractInstance,
  AztecDroppedTx,
  AztecIndexerRequestOptions,
  AztecNetworkErrors,
  AztecNetworkInfo,
  AztecPendingTx,
  AztecPublicLogsSearchResult,
  AztecSearchResult,
  AztecTxEffect,
  BlocksQueryParams,
  HexString,
  LatestHeightResponse,
  PendingTxsQueryParams,
  PublicLogsSearchParams,
  SearchQueryParams,
  TotalContractsLast24hResponse,
  TotalContractsResponse,
  TotalTxEffectsResponse,
  TxEffectsLast24hResponse,
  TxEffectsQueryParams,
} from './types';

const { logDebug, logError } = logger('aztec-indexer-endpoints');

/**
 * Safely execute a client request with error handling
 * @param fn - Async function to execute
 * @param fallback - Fallback value to return on error
 * @param errorContext - Context for error logging
 */
const safeRequest = async <T>(fn: () => Promise<T>, fallback: T, errorContext: string): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    logError(`${errorContext}: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
};

// ============================================
// BLOCKS
// ============================================

/**
 * Get latest block height
 *
 * @param options - Request options
 * @returns Latest block height (number)
 *
 * @example
 * ```ts
 * const height = await getLatestHeight();
 * console.log(`Latest block: ${height}`);
 * ```
 */
export const getLatestHeight = async (options?: AztecIndexerRequestOptions): Promise<LatestHeightResponse> => {
  logDebug('Fetching latest height');
  return safeRequest(
    () => client.get<LatestHeightResponse>('/l2/latest-height', null, options),
    0,
    'Failed to fetch latest height',
  );
};

/**
 * Get latest block
 *
 * @param options - Request options
 * @returns Latest block details
 *
 * @example
 * ```ts
 * const block = await getLatestBlock({
 *   revalidate: 10, // Revalidate every 10 seconds
 *   tags: ['aztec-latest-block']
 * });
 * ```
 */
export const getLatestBlock = async (options?: AztecIndexerRequestOptions): Promise<AztecBlock | null> => {
  logDebug('Fetching latest block');
  return safeRequest(
    () => client.get<AztecBlock>('/l2/blocks/latest', null, options),
    null,
    'Failed to fetch latest block',
  );
};

/**
 * Get list of blocks with pagination
 *
 * @param params - Query parameters (from, limit)
 * @param options - Request options
 * @returns Array of blocks
 *
 * @example
 * ```ts
 * const blocks = await getBlocks({ from: 0, limit: 10 });
 * ```
 */
export const getBlocks = async (
  params?: BlocksQueryParams,
  options?: AztecIndexerRequestOptions,
): Promise<AztecBlock[]> => {
  logDebug(`Fetching blocks with params: ${JSON.stringify(params)}`);
  return safeRequest(
    () => client.get<AztecBlock[]>('/l2/blocks', params as client.QueryParams | null, options),
    [],
    'Failed to fetch blocks',
  );
};

/**
 * Get block by height
 *
 * @param height - Block height
 * @param options - Request options
 * @returns Block details
 *
 * @example
 * ```ts
 * const block = await getBlockByHeight(12345, {
 *   revalidate: false, // Cache indefinitely (blocks are immutable)
 *   tags: [`aztec-block-${height}`]
 * });
 * ```
 */
export const getBlockByHeight = async (height: number, options?: AztecIndexerRequestOptions): Promise<AztecBlock | null> => {
  logDebug(`Fetching block at height ${height}`);
  return safeRequest(
    () => client.get<AztecBlock>(`/l2/blocks/${height}`, null, options),
    null,
    `Failed to fetch block at height ${height}`,
  );
};

/**
 * Get block by hash
 *
 * @param hash - Block hash (0x-prefixed hex string)
 * @param options - Request options
 * @returns Block details
 *
 * @example
 * ```ts
 * const block = await getBlockByHash('0xabc123...');
 * ```
 */
export const getBlockByHash = async (hash: HexString, options?: AztecIndexerRequestOptions): Promise<AztecBlock | null> => {
  logDebug(`Fetching block with hash ${hash}`);
  return safeRequest(
    () => client.get<AztecBlock>(`/l2/blocks/${hash}`, null, options),
    null,
    `Failed to fetch block with hash ${hash}`,
  );
};

// ============================================
// CONTRACTS
// ============================================

/**
 * Get all contract classes
 *
 * @param options - Request options
 * @returns Array of contract classes
 *
 * @example
 * ```ts
 * const classes = await getContractClasses({
 *   revalidate: 60,
 *   tags: ['aztec-contract-classes']
 * });
 * ```
 */
export const getContractClasses = async (options?: AztecIndexerRequestOptions): Promise<AztecContractClass[]> => {
  logDebug('Fetching contract classes');
  return safeRequest(
    () => client.get<AztecContractClass[]>('/l2/contract-classes', null, options),
    [],
    'Failed to fetch contract classes',
  );
};

/**
 * Get all contract instances
 *
 * @param options - Request options
 * @returns Array of contract instances
 *
 * @example
 * ```ts
 * const instances = await getContractInstances({
 *   revalidate: 60,
 *   tags: ['aztec-contract-instances']
 * });
 * ```
 */
export const getContractInstances = async (options?: AztecIndexerRequestOptions): Promise<AztecContractInstance[]> => {
  logDebug('Fetching contract instances');
  return safeRequest(
    () => client.get<AztecContractInstance[]>('/l2/contract-instances', null, options),
    [],
    'Failed to fetch contract instances',
  );
};

/**
 * Get specific contract instance by address
 *
 * @param address - Contract address (0x-prefixed hex string)
 * @param options - Request options
 * @returns Contract instance details
 *
 * @example
 * ```ts
 * const contract = await getContractInstance('0x123abc...', {
 *   revalidate: 300, // Cache for 5 minutes
 *   tags: [`aztec-contract-${address}`]
 * });
 * ```
 */
export const getContractInstance = async (
  address: HexString,
  options?: AztecIndexerRequestOptions,
): Promise<AztecContractInstance | null> => {
  logDebug(`Fetching contract instance at ${address}`);
  return safeRequest(
    () => client.get<AztecContractInstance>(`/l2/contract-instances/${address}`, null, options),
    null,
    `Failed to fetch contract instance at ${address}`,
  );
};

// ============================================
// NETWORK
// ============================================

/**
 * Get L2 network information
 *
 * @param options - Request options
 * @returns Network info (version, chainId, rollupAddress, etc.)
 *
 * @example
 * ```ts
 * const info = await getInfo();
 * console.log(`Chain ID: ${info.chainId}`);
 * ```
 */
export const getInfo = async (options?: AztecIndexerRequestOptions): Promise<AztecNetworkInfo | null> => {
  logDebug('Fetching network info');
  return safeRequest(
    () => client.get<AztecNetworkInfo>('/l2/info', null, options),
    null,
    'Failed to fetch network info',
  );
};

/**
 * Get network errors
 *
 * @param options - Request options
 * @returns Network errors list
 *
 * @example
 * ```ts
 * const { errors } = await getErrors();
 * errors?.forEach(err => console.error(err.message));
 * ```
 */
export const getErrors = async (options?: AztecIndexerRequestOptions): Promise<AztecNetworkErrors | null> => {
  logDebug('Fetching network errors');
  return safeRequest(
    () => client.get<AztecNetworkErrors>('/l2/errors', null, options),
    null,
    'Failed to fetch network errors',
  );
};

// ============================================
// SEARCH
// ============================================

/**
 * Search by hash, height, or address
 *
 * @param params - Search query params
 * @param options - Request options
 * @returns Search result (block, transaction, or contract)
 *
 * @example
 * ```ts
 * // Search by height
 * const result = await search({ q: '123' });
 *
 * // Search by hash
 * const result = await search({ q: '0xabc123...' });
 * ```
 */
export const search = async (
  params: SearchQueryParams,
  options?: AztecIndexerRequestOptions,
): Promise<AztecSearchResult | null> => {
  logDebug(`Searching for: ${params.q}`);
  return safeRequest(
    () => client.get<AztecSearchResult>('/l2/search', params as client.QueryParams, options),
    null,
    `Failed to search for: ${params.q}`,
  );
};

/**
 * Search transactions by public logs
 * Find transactions that have a specific value at a specific position in their public logs
 *
 * @param params - Search params (frLogEntry, index)
 * @param options - Request options
 * @returns Matching transactions
 *
 * @example
 * ```ts
 * // Search for transactions where first log position (index=0) has specific value
 * const result = await searchPublicLogs({
 *   frLogEntry: '0x0000000000000000000000000000000000000000000000000000000000000005',
 *   index: 0
 * });
 * console.log(`Found ${result.total} matching transactions`);
 * ```
 */
export const searchPublicLogs = async (
  params: PublicLogsSearchParams,
  options?: AztecIndexerRequestOptions,
): Promise<AztecPublicLogsSearchResult | null> => {
  logDebug(`Searching public logs: frLogEntry=${params.frLogEntry}, index=${params.index}`);
  return safeRequest(
    () => client.get<AztecPublicLogsSearchResult>('/l2/search/public-logs', params as client.QueryParams, options),
    null,
    `Failed to search public logs`,
  );
};

// ============================================
// TX EFFECTS (Transactions)
// ============================================

/**
 * Get all tx effects (transactions) with pagination
 *
 * @param params - Query params (from, limit)
 * @param options - Request options
 * @returns Array of tx effects
 *
 * @example
 * ```ts
 * const txs = await getTxEffects({ from: 0, limit: 10 });
 * txs.forEach(tx => {
 *   console.log(`TX ${tx.hash}: ${tx.revertCode === 0 ? 'Success' : 'Reverted'}`);
 * });
 * ```
 */
export const getTxEffects = async (
  params?: TxEffectsQueryParams,
  options?: AztecIndexerRequestOptions,
): Promise<AztecTxEffect[]> => {
  logDebug(`Fetching tx effects with params: ${JSON.stringify(params)}`);
  return safeRequest(
    () => client.get<AztecTxEffect[]>('/l2/tx-effects', params as client.QueryParams | null, options),
    [],
    'Failed to fetch tx effects',
  );
};

/**
 * Get all tx effects for a specific block
 *
 * @param height - Block height
 * @param options - Request options
 * @returns Array of tx effects in the block
 *
 * @example
 * ```ts
 * const txs = await getBlockTxEffects(12345);
 * console.log(`Block 12345 has ${txs.length} transactions`);
 * ```
 */
export const getBlockTxEffects = async (
  height: number,
  options?: AztecIndexerRequestOptions,
): Promise<AztecTxEffect[]> => {
  logDebug(`Fetching tx effects for block ${height}`);
  return safeRequest(
    () => client.get<AztecTxEffect[]>(`/l2/blocks/${height}/tx-effects`, null, options),
    [],
    `Failed to fetch tx effects for block ${height}`,
  );
};

/**
 * Get specific tx effect by index in block
 *
 * @param height - Block height
 * @param index - TX index in block (0, 1, 2, ...)
 * @param options - Request options
 * @returns TX effect details
 *
 * @example
 * ```ts
 * // Get first transaction in block 12345
 * const tx = await getBlockTxEffectByIndex(12345, 0);
 * console.log(`Public logs:`, tx.publicLogs);
 * ```
 */
export const getBlockTxEffectByIndex = async (
  height: number,
  index: number,
  options?: AztecIndexerRequestOptions,
): Promise<AztecTxEffect | null> => {
  logDebug(`Fetching tx effect at block ${height}, index ${index}`);
  return safeRequest(
    () => client.get<AztecTxEffect>(`/l2/blocks/${height}/tx-effects/${index}`, null, options),
    null,
    `Failed to fetch tx effect at block ${height}, index ${index}`,
  );
};

/**
 * Get tx effect by hash
 *
 * @param hash - Transaction hash (0x-prefixed hex string)
 * @param options - Request options
 * @returns TX effect details
 *
 * @example
 * ```ts
 * const tx = await getTxEffectByHash('0xabc123...', {
 *   revalidate: false, // Cache indefinitely (tx is immutable)
 *   tags: [`aztec-tx-${hash}`]
 * });
 *
 * // Check if transaction succeeded
 * if (tx.revertCode === 0) {
 *   console.log('Transaction successful!');
 * }
 * ```
 */
export const getTxEffectByHash = async (
  hash: HexString,
  options?: AztecIndexerRequestOptions,
): Promise<AztecTxEffect | null> => {
  logDebug(`Fetching tx effect with hash ${hash}`);
  return safeRequest(
    () => client.get<AztecTxEffect>(`/l2/tx-effects/${hash}`, null, options),
    null,
    `Failed to fetch tx effect with hash ${hash}`,
  );
};

// ============================================
// PENDING TRANSACTIONS (Mempool)
// ============================================

/**
 * Get pending transactions (waiting to be included in a block)
 *
 * @param params - Query params (limit)
 * @param options - Request options
 * @returns Array of pending transactions
 *
 * @example
 * ```ts
 * const pending = await getPendingTxs({ limit: 10 });
 * console.log(`${pending.length} transactions in mempool`);
 * ```
 */
export const getPendingTxs = async (
  params?: PendingTxsQueryParams,
  options?: AztecIndexerRequestOptions,
): Promise<AztecPendingTx[]> => {
  logDebug(`Fetching pending txs with params: ${JSON.stringify(params)}`);
  return safeRequest(
    () => client.get<AztecPendingTx[]>('/l2/txs', params as client.QueryParams | null, options),
    [],
    'Failed to fetch pending txs',
  );
};

/**
 * Get specific pending transaction by hash
 *
 * @param hash - Transaction hash (0x-prefixed hex string)
 * @param options - Request options
 * @returns Pending transaction details
 *
 * @example
 * ```ts
 * const pendingTx = await getPendingTx('0xabc123...');
 * console.log(`Status: ${pendingTx.status}`);
 * ```
 */
export const getPendingTx = async (hash: HexString, options?: AztecIndexerRequestOptions): Promise<AztecPendingTx | null> => {
  logDebug(`Fetching pending tx with hash ${hash}`);
  return safeRequest(
    () => client.get<AztecPendingTx>(`/l2/txs/${hash}`, null, options),
    null,
    `Failed to fetch pending tx with hash ${hash}`,
  );
};

/**
 * Get dropped transaction by hash
 *
 * @param hash - Transaction hash (0x-prefixed hex string)
 * @param options - Request options
 * @returns Dropped transaction details
 *
 * @example
 * ```ts
 * const droppedTx = await getDroppedTx('0xabc123...');
 * console.log(`Dropped reason: ${droppedTx.reason}`);
 * ```
 */
export const getDroppedTx = async (hash: HexString, options?: AztecIndexerRequestOptions): Promise<AztecDroppedTx | null> => {
  logDebug(`Fetching dropped tx with hash ${hash}`);
  return safeRequest(
    () => client.get<AztecDroppedTx>(`/l2/dropped-txs/${hash}`, null, options),
    null,
    `Failed to fetch dropped tx with hash ${hash}`,
  );
};

// ============================================
// STATISTICS
// ============================================

/**
 * Get total number of tx effects (all-time)
 *
 * @param options - Request options
 * @returns Total tx effects count
 *
 * @example
 * ```ts
 * const total = await getTotalTxEffects();
 * console.log(`Total transactions: ${total}`);
 * ```
 */
export const getTotalTxEffects = async (options?: AztecIndexerRequestOptions): Promise<TotalTxEffectsResponse> => {
  logDebug('Fetching total tx effects');
  return safeRequest(
    () => client.get<TotalTxEffectsResponse>('/l2/stats/total-tx-effects', null, options),
    0,
    'Failed to fetch total tx effects',
  );
};

/**
 * Get number of tx effects in last 24 hours
 *
 * @param options - Request options
 * @returns TX effects count (last 24h)
 *
 * @example
 * ```ts
 * const last24h = await getTxEffectsLast24h();
 * console.log(`Transactions (24h): ${last24h}`);
 * ```
 */
export const getTxEffectsLast24h = async (options?: AztecIndexerRequestOptions): Promise<TxEffectsLast24hResponse> => {
  logDebug('Fetching tx effects last 24h');
  return safeRequest(
    () => client.get<TxEffectsLast24hResponse>('/l2/stats/tx-effects-last-24h', null, options),
    0,
    'Failed to fetch tx effects last 24h',
  );
};

/**
 * Get total number of contracts (all-time)
 *
 * @param options - Request options
 * @returns Total contracts count
 *
 * @example
 * ```ts
 * const total = await getTotalContracts();
 * console.log(`Total contracts: ${total}`);
 * ```
 */
export const getTotalContracts = async (options?: AztecIndexerRequestOptions): Promise<TotalContractsResponse> => {
  logDebug('Fetching total contracts');
  return safeRequest(
    () => client.get<TotalContractsResponse>('/l2/stats/total-contracts', null, options),
    0,
    'Failed to fetch total contracts',
  );
};

/**
 * Get number of contracts deployed in last 24 hours
 *
 * @param options - Request options
 * @returns Contracts count (last 24h)
 *
 * @example
 * ```ts
 * const last24h = await getTotalContractsLast24h();
 * console.log(`New contracts (24h): ${last24h}`);
 * ```
 */
export const getTotalContractsLast24h = async (
  options?: AztecIndexerRequestOptions,
): Promise<TotalContractsLast24hResponse> => {
  logDebug('Fetching total contracts last 24h');
  return safeRequest(
    () => client.get<TotalContractsLast24hResponse>('/l2/stats/total-contracts-last-24h', null, options),
    0,
    'Failed to fetch total contracts last 24h',
  );
};

/**
 * Get average transaction fees
 *
 * @param options - Request options
 * @returns Average fee details
 *
 * @example
 * ```ts
 * const { averageFee, currency } = await getAverageFees();
 * console.log(`Average fee: ${averageFee} ${currency || ''}`);
 * ```
 */
export const getAverageFees = async (options?: AztecIndexerRequestOptions): Promise<AverageFeeResponse | null> => {
  logDebug('Fetching average fees');
  return safeRequest(
    () => client.get<AverageFeeResponse>('/l2/stats/average-fees', null, options),
    null,
    'Failed to fetch average fees',
  );
};

/**
 * Get average block time
 *
 * @param options - Request options
 * @returns Average block time details
 *
 * @example
 * ```ts
 * const { averageBlockTime, unit } = await getAverageBlockTime();
 * console.log(`Average block time: ${averageBlockTime} ${unit || 'seconds'}`);
 * ```
 */
export const getAverageBlockTime = async (options?: AztecIndexerRequestOptions): Promise<AverageBlockTimeResponse | null> => {
  logDebug('Fetching average block time');
  return safeRequest(
    () => client.get<AverageBlockTimeResponse>('/l2/stats/average-block-time', null, options),
    null,
    'Failed to fetch average block time',
  );
};
