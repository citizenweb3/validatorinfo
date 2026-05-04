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
  total_transactions: number;
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
  transactions?: LogosTx[];
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

export interface LogosPagination {
  limit: number;
  offset: number;
  order?: 'asc' | 'desc';
  sort?: 'height' | 'slot';
  has_more: boolean;
}

export type LogosBlocksPagination = LogosPagination;

export interface LogosBlocksResponse {
  data: LogosBlock[];
  pagination: LogosBlocksPagination;
}

export interface LogosTx {
  id: string;
  hash: string;
  tx_hash: string | null;
  block_id: string;
  position: number;
  slot: number;
  height: number | null;
  finalized: boolean;
  op_count: number;
  // Not in current docs but present in API response — proof types and op types per tx
  op_types?: string[];
  proof_types?: string[];
  storage_gas_price: number | null;
  execution_gas_price: number | null;
  indexed_at: string;
}

export interface LogosTxsResponse {
  data: LogosTx[];
  pagination: LogosPagination;
}

export interface LogosTxOpPayload {
  parent?: string;
  signer?: string;
  channel_id?: string;
  inscription?: {
    format: string;
    length: number;
    hex_preview: string;
    truncated: boolean;
    ascii_fragments?: string[];
  };
  [key: string]: unknown;
}

export interface LogosTxOp {
  index: number;
  opcode: number;
  opcode_name: string;
  proof_type: string;
  payload: LogosTxOpPayload;
}

export interface LogosTxDecoded {
  format: string;
  op_count: number;
  proof_count: number;
  op_types: string[];
  proof_types: string[];
  ops: LogosTxOp[];
}

export interface LogosTxRawOp {
  opcode: number;
  payload: Record<string, unknown>;
}

export interface LogosTxRaw {
  mantle_tx: {
    ops: LogosTxRawOp[];
    storage_gas_price: number;
    execution_gas_price: number;
  };
  ops_proofs: Array<Record<string, number[]>>;
}

export interface LogosTxDetail extends LogosTx {
  decoded?: LogosTxDecoded;
  raw?: LogosTxRaw;
}
