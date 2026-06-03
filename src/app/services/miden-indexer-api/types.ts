export interface MidenIndexerRequestOptions {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  timeout?: number;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface MidenStats {
  last_block: string;
  total_blocks: number;
  total_transactions: number;
  total_notes: number;
  total_nullifiers: number;
  total_accounts: number;
  latest_block_timestamp: string;
  // `tps` was added to /stats in Stage 3; optional for backward-compat with cached responses.
  tps?: number;
}

export interface MidenBlock {
  block_num: string;
  block_hash: string;
  prev_block_commitment: string;
  chain_commitment: string;
  account_root: string;
  nullifier_root: string;
  note_root: string;
  tx_commitment: string;
  validator_key: string;
  tx_kernel_commitment: string;
  native_asset_id: string;
  verification_base_fee: string;
  timestamp: string;
  tx_count: number;
  note_count: number;
  nullifier_count: number;
  version: number;
  chain_length: number | null;
  inserted_at: string;
  raw_block_bytes?: string;
}

export interface MidenBlocksResponse {
  data: MidenBlock[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Miden transaction shape — verified live 2026-05-19 against
 * GET /api/v1/transactions and GET /api/v1/transactions/{tx_id}.
 * Detail endpoint returns the same fields as the list item (no extra metadata).
 * `input_nullifiers` / `output_note_ids` arrive as `null` for the empty case
 * (not `[]`); when populated they are hex string arrays.
 * `block_timestamp` (on-chain production time of the parent block) was added
 * upstream on 2026-06-03; before that only `inserted_at` (indexer write time)
 * was available. Optional for backward-compat with cached pre-fix responses.
 */
export interface MidenTransaction {
  tx_id: string;
  block_num: number;
  account_id: string;
  init_account_state: string;
  final_account_state: string;
  input_notes_commitment: string;
  output_notes_commitment: string;
  expiration_block_num: number | null;
  input_nullifiers: string[] | null;
  output_note_ids: string[] | null;
  block_timestamp?: string;
  inserted_at: string;
  account_id_bech32: string;
}

export type MidenTxDetail = MidenTransaction;

export interface MidenTransactionsResponse {
  data: MidenTransaction[];
  total: number;
  limit: number;
  offset: number;
}
