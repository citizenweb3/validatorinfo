export interface LogosIndexerRequestOptions {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  timeout?: number;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface LogosStats {
  total_blocks: number;
  finalized_blocks: number;
  latest_slot: number;
  latest_height: number | null;
  // Renamed by upstream from `leaders_count` to `leader_keys_count` (one-time leader keys).
  leader_keys_count: number;
  last_indexed_slot: number;
  node_tip_slot: number;
  node_height: number;
  node_mode: 'Online' | 'Syncing' | string;
  lag_slots: number;
}

export interface LogosBlock {
  id: string;
  parent_block: string;
  slot: number;
  height: number | null;
  block_root: string;
  leader_key: string;
  voucher_cm: string;
  entropy: string;
  tx_count: number;
  finalized: boolean;
  indexed_at: string;
  raw?: LogosBlockRaw;
}

export interface LogosBlockRaw {
  header: {
    id: string;
    slot: number;
    block_root: string;
    parent_block: string;
    proof_of_leadership: {
      proof: number[];
      leader_key: string;
      voucher_cm: string;
      entropy_contribution: string;
    };
  };
  transactions: unknown[];
}

export interface LogosBlocksPagination {
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface LogosBlocksResponse {
  data: LogosBlock[];
  pagination: LogosBlocksPagination;
}
