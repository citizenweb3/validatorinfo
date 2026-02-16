/**
 * Hex string type (0x-prefixed)
 */
export type HexString = `0x${string}` | string;

/**
 * Response from /l2/latest-height endpoint
 */
export type LatestHeightResponse = number;

/**
 * Tree state structure used in Aztec blocks
 */
export interface TreeState {
  root: HexString;
  nextAvailableLeafIndex: number;
}

/**
 * Buffer data from API (type: "Buffer", data: number[])
 */
export interface BufferData {
  type: 'Buffer';
  data: number[];
}

/**
 * Content commitment in block header
 */
export interface ContentCommitment {
  blobsHash: BufferData;
  inHash: BufferData;
  outHash: BufferData;
}

/**
 * Partial state (note hash, nullifier, public data trees)
 */
export interface PartialState {
  noteHashTree: TreeState;
  nullifierTree: TreeState;
  publicDataTree: TreeState;
}

/**
 * Block state including L1-L2 messages and partial state
 */
export interface BlockState {
  l1ToL2MessageTree: TreeState;
  partial: PartialState;
}

/**
 * Gas fees structure
 */
export interface GasFees {
  feePerDaGas: number;
  feePerL2Gas: number;
}

/**
 * Global variables in block header
 */
export interface GlobalVariables {
  chainId: number;
  version: number;
  blockNumber: number;
  slotNumber: number;
  timestamp: number;
  coinbase: HexString;
  feeRecipient: HexString;
  gasFees: GasFees;
}

/**
 * Block header structure
 */
export interface BlockHeader {
  lastArchive: TreeState;
  contentCommitment: ContentCommitment;
  state: BlockState;
  globalVariables: GlobalVariables;
  totalFees: string;
  totalManaUsed: string;
}

/**
 * Block body containing tx effects
 */
export interface BlockBody {
  txEffects: AztecTxEffect[];
}

/**
 * Aztec L2 Block (Real API structure)
 * Response from /l2/blocks/:height, /l2/blocks/latest, /l2/blocks/:hash
 *
 * IMPORTANT: height comes as STRING from API, not number!
 */
export interface AztecBlock {
  /** Block hash (0x-prefixed) */
  hash: HexString;
  /** Block height - comes as STRING from API */
  height: string | number;
  /** Finalization status (0 = unfinalized, 3 = finalized) */
  finalizationStatus: number;
  /** Archive tree state */
  archive: TreeState;
  /** Block header with all metadata */
  header: BlockHeader;
  /** Block body with transactions */
  body: BlockBody;

  /** Allow additional fields from API */
  [key: string]: unknown;
}

/**
 * Pagination parameters for list endpoints
 */
export interface BlocksQueryParams {
  from?: number; // Start from block height
  limit?: number; // Max number of results
  [key: string]: string | number | boolean | undefined;
}

/**
 * Private log structure from Aztec tx-effect
 */
export interface AztecPrivateLog {
  fields: HexString[];
  emittedLength: number;
}

/**
 * Public log structure from Aztec tx-effect
 */
export interface AztecPublicLog {
  contractAddress: HexString;
  fields: HexString[];
  emittedLength: number;
}

/**
 * Public data write from Aztec tx-effect
 */
export interface AztecPublicDataWrite {
  leafSlot: HexString;
  value: HexString;
}

/**
 * Transaction Effect (TX Effect)
 * In Aztec, transactions are called "tx effects"
 * Response from /l2/tx-effects/:hash, /l2/blocks/:height/tx-effects/:index
 *
 * IMPORTANT: Field names and types match the real chain-data-indexer API.
 * - txHash (not "hash")
 * - revertCode is { code: number } (not plain number)
 * - blockHeight is string (not number)
 * - logs are structured objects (not flat arrays)
 */
export interface AztecTxEffect {
  /** Transaction hash (0x-prefixed hex string) */
  txHash: HexString;

  /** Block hash (0x-prefixed hex string) */
  blockHash: HexString;

  /** Block height containing this transaction — comes as STRING from API */
  blockHeight: string;

  /** Index in block (0, 1, 2, ...) — may be absent in API response */
  index?: number;

  /** Revert code object (code: 0 = success, non-zero = reverted) */
  revertCode: { code: number };

  /** Whether this tx-effect is orphaned */
  isOrphaned: boolean;

  /** Transaction fee (as string for precision with large numbers) */
  transactionFee: string | number;

  /** Note hashes created by this transaction */
  noteHashes: HexString[];

  /** Nullifiers consumed by this transaction */
  nullifiers: HexString[];

  /** L2 to L1 messages */
  l2ToL1Msgs: HexString[];

  /** Public logs — structured objects with contractAddress and fields */
  publicLogs: AztecPublicLog[];

  /** Private logs — structured objects with fields and emittedLength */
  privateLogs: AztecPrivateLog[];

  /** Contract class logs */
  contractClassLogs: AztecPublicLog[];

  /** Public data writes */
  publicDataWrites: AztecPublicDataWrite[];

  /** Timestamp when tx was born (unix ms) */
  txBirthTimestamp: number;

  /** Block timestamp (unix ms) */
  timestamp: number;

  [key: string]: unknown;
}

/**
 * Query params for tx-effects list
 */
export interface TxEffectsQueryParams {
  from?: number; // Start offset
  limit?: number; // Max results
  [key: string]: string | number | boolean | undefined;
}

/**
 * Pending Transaction (mempool)
 * Response from /l2/txs/:hash, /l2/txs
 *
 * Fields match the real chain-data-indexer API (chicmozL2PendingTxSchema)
 */
export interface AztecPendingTx {
  txHash: HexString;
  feePayer: HexString;
  birthTimestamp: number;

  [key: string]: unknown;
}

/**
 * Query params for pending txs
 */
export interface PendingTxsQueryParams {
  limit?: number;

  [key: string]: string | number | boolean | undefined;
}

/**
 * Dropped Transaction
 * Response from /l2/dropped-txs/:hash
 *
 * Fields match the real chain-data-indexer API (chicmozL2DroppedTxSchema)
 */
export interface AztecDroppedTx {
  txHash: HexString;
  createdAsPendingAt: number;
  droppedAt: number;

  [key: string]: unknown;
}

/**
 * Contract Class
 * Response from /l2/contract-classes
 */
export interface AztecContractClass {
  id: HexString;
  artifactHash?: HexString;
  privateFunctionsRoot?: HexString;
  publicBytecodeCommitment?: HexString;

  [key: string]: unknown;
}

/**
 * Contract Instance
 * Response from /l2/contract-instances/:address, /l2/contract-instances
 */
export interface AztecContractInstance {
  address: HexString;
  version?: number;
  salt?: HexString;
  deployer?: HexString;
  contractClassId?: HexString;
  initializationHash?: HexString;
  publicKeysHash?: HexString;

  [key: string]: unknown;
}

/**
 * Network Information
 * Response from /l2/info
 */
export interface AztecNetworkInfo {
  version?: string;
  chainId?: number;
  rollupAddress?: HexString;
  l1ChainId?: number;

  [key: string]: unknown;
}

/**
 * Network Errors
 * Response from /l2/errors
 */
export interface AztecNetworkErrors {
  errors?: Array<{
    message: string;
    timestamp?: string;
    [key: string]: unknown;
  }>;

  [key: string]: unknown;
}

/**
 * Search Query Params
 */
export interface SearchQueryParams {
  q: string; // Search query (hash, height, address, etc.)
  [key: string]: string | number | boolean | undefined;
}

/**
 * Search Result
 * Response from /l2/search?q=...
 */
export interface AztecSearchResult {
  type?: 'block' | 'transaction' | 'contract' | 'unknown';
  result?: AztecBlock | AztecTxEffect | AztecContractInstance | unknown;

  [key: string]: unknown;
}

/**
 * Public Logs Search Params
 */
export interface PublicLogsSearchParams {
  frLogEntry: HexString; // Field element in hex (e.g. 0x1234...)
  index: number; // Position in log array (0, 1, 2...)
  [key: string]: string | number | boolean | undefined;
}

/**
 * Public Logs Search Result
 * Response from /l2/search/public-logs?frLogEntry=...&index=...
 */
export interface AztecPublicLogsSearchResult {
  transactions?: AztecTxEffect[];
  total?: number;

  [key: string]: unknown;
}

/**
 * Stats: Total TX Effects
 * Response from /l2/stats/total-tx-effects
 */
export type TotalTxEffectsResponse = number;

/**
 * Stats: TX Effects Last 24h
 * Response from /l2/stats/tx-effects-last-24h
 */
export type TxEffectsLast24hResponse = number;

/**
 * Stats: Total Contracts
 * Response from /l2/stats/total-contracts
 */
export type TotalContractsResponse = number;

/**
 * Stats: Total Contracts Last 24h
 * Response from /l2/stats/total-contracts-last-24h
 */
export type TotalContractsLast24hResponse = number;

/**
 * Stats: Average Fees
 * Response from /l2/stats/average-fees
 *
 * IMPORTANT: Returns a plain string number, not an object!
 * Example: "0" or "12345"
 */
export type AverageFeeResponse = string | number;

/**
 * Stats: Average Block Time
 * Response from /l2/stats/average-block-time
 *
 * IMPORTANT: Returns a plain string number, not an object!
 * Example: "83684" (milliseconds)
 */
export type AverageBlockTimeResponse = string | number;

/**
 * UI: Lightweight tx-effect for table display
 * Response from /l2/ui/tx-effects-for-table
 */
export interface UiTxEffectTableItem {
  blockNumber: number | string;
  txHash: HexString;
  transactionFee: number | string;
  timestamp: number;
}

/**
 * Options for fetch requests to Aztec Indexer
 */
export interface AztecIndexerRequestOptions {
  /**
   * Cache strategy for Next.js
   * @default 'no-store' (force-dynamic)
   */
  cache?: RequestCache;

  /**
   * Revalidation time in seconds (ISR)
   * @default undefined (no revalidation)
   */
  revalidate?: number | false;

  /**
   * Cache tags for on-demand revalidation
   * @default []
   */
  tags?: string[];

  /**
   * Request timeout in milliseconds
   * @default 10000 (10 seconds)
   */
  timeout?: number;

  /**
   * Custom headers to merge with defaults
   */
  headers?: HeadersInit;

  /**
   * Signal for request cancellation
   */
  signal?: AbortSignal;
}

/**
 * Generic API error response structure
 */
export interface AztecIndexerErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}
