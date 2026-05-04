export interface LogosStats {
  total_blocks: number;
  finalized_blocks: number;
  latest_slot: number;
  latest_height: number | null;
  leaders_count: number;
  last_indexed_slot: number;
  node_tip_slot: number;
  node_height: number;
  node_mode: 'Online' | 'Syncing' | string;
  lag_slots: number;
}

export interface LogosBlockSample {
  slot: number;
  height: number | null;
  indexed_at: string;
}

export interface LogosBlocksResponse {
  data: LogosBlockSample[];
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}
