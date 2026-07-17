export interface AtomoneIndexerRequestOptions {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  timeout?: number;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface AtomoneBlockSummary {
  block_hash: string;
  height: string;
  time: string;
  tx_count: number;
  proposer_address: string;
}

export interface AtomoneBlockDetail extends AtomoneBlockSummary {
  size_bytes: number | null;
  last_commit_hash: string | null;
  data_hash: string | null;
  app_hash: string | null;
  evidence_count: number;
}

export interface AtomoneBlocksStats {
  total_blocks: string;
  last_height: string;
}

export interface AtomoneTxFeeSummary {
  amount: string | null;
  denom: string | null;
}

export interface AtomoneTxSummary {
  tx_hash: string;
  height: string;
  tx_index: number;
  time: string;
  code: number;
  first_msg_type: string | null;
  fee: AtomoneTxFeeSummary | null;
}

export interface AtomoneTxFeeAmount {
  amount: string;
  denom: string;
}

export interface AtomoneTxFee {
  amount: AtomoneTxFeeAmount[];
  gas_limit: string;
  payer: string;
  granter: string;
}

export interface AtomoneTxMessage {
  msg_index: number;
  type_url: string;
  value: Record<string, unknown>;
  signer: string | null;
}

export interface AtomoneTxEvent {
  msg_index: number;
  event_index: number;
  event_type: string;
  attributes: unknown;
}

export interface AtomoneTxDetail {
  tx_hash: string;
  height: string;
  tx_index: number;
  time: string;
  code: number;
  gas_wanted: string | null;
  gas_used: string | null;
  fee: AtomoneTxFee | null;
  memo: string | null;
  signers: string[] | null;
  log_summary: string | null;
  messages: AtomoneTxMessage[];
  events: AtomoneTxEvent[];
}

export interface AtomoneTxsStats {
  total_txs: string;
  last_height: string;
}

export interface AtomoneBlocksCursor {
  next_before_height: string;
}

export interface AtomoneTxsCursor {
  next_before_height: string;
  next_before_index: number;
}

export interface AtomoneDelegationEvent {
  delegator_address: string;
  amount: string;
  denom: string;
  height: string;
  tx_index: number;
  msg_index: number;
  tx_hash: string;
  time: string;
}

export interface AtomoneDelegationsCursor {
  next_before_height: string;
  next_before_index: number;
  next_before_msg_index: number;
}

export interface AtomoneListResponse<T, C = AtomoneBlocksCursor | AtomoneTxsCursor> {
  data: T[];
  cursor: C | null;
  has_more: boolean;
  total: string;
}

export type AtomoneBlocksListResponse = AtomoneListResponse<AtomoneBlockSummary, AtomoneBlocksCursor>;
export type AtomoneTxsListResponse = AtomoneListResponse<AtomoneTxSummary, AtomoneTxsCursor>;
export type AtomoneDelegationsResponse = AtomoneListResponse<AtomoneDelegationEvent, AtomoneDelegationsCursor>;

export interface AtomoneBlockDetailResponse {
  data: AtomoneBlockDetail;
}

export interface AtomoneBlocksStatsResponse {
  data: AtomoneBlocksStats;
}

export interface AtomoneTxDetailResponse {
  data: AtomoneTxDetail;
}

export interface AtomoneTxRawResponse {
  data: {
    raw_tx: unknown;
  };
}

export interface AtomoneTxsStatsResponse {
  data: AtomoneTxsStats;
}

export type AtomoneGovVoteOption = 'YES' | 'NO' | 'ABSTAIN' | 'VETO' | 'UNSPECIFIED';

export interface AtomoneGovVote {
  proposal_id: string;
  option: AtomoneGovVoteOption;
  weight: string | null;
  height: string;
  tx_hash: string;
}

export interface AtomoneGovVotesCursor {
  next_before_proposal_id: string;
}

export type AtomoneGovVotesResponse = AtomoneListResponse<AtomoneGovVote, AtomoneGovVotesCursor>;

export interface AtomoneCoverage {
  earliest_height: string;
  earliest_time: string;
}

export interface AtomoneCoverageResponse {
  data: AtomoneCoverage;
}

export type AtomoneEarliestActivitySource = 'actor' | 'transfer_out' | 'transfer_in';

export interface AtomoneEarliestActivity {
  height: string;
  tx_index: number;
  tx_hash: string;
  time: string;
  source: AtomoneEarliestActivitySource;
}

export interface AtomoneEarliestActivityResponse {
  data: {
    earliest: AtomoneEarliestActivity | null;
    coverage: AtomoneCoverage;
  };
}

export type AtomoneStakingDeltaEventType =
  | 'delegate'
  | 'redelegate'
  | 'unbond'
  | 'create_validator'
  | 'cancel_unbonding_delegation';

export interface AtomoneStakingDelta {
  height: string;
  tx_index: number;
  msg_index: number;
  tx_hash: string;
  time: string;
  event_type: AtomoneStakingDeltaEventType;
  validator_src: string | null;
  validator_dst: string | null;
  denom: string;
  amount: string;
  sign: 1 | -1 | 0;
  source: 'event' | 'message';
}

export interface AtomoneStakingDeltasCursor {
  next_before_height: string;
  next_before_index: number;
  next_before_msg_index: number;
}

export interface AtomoneStakingDeltasResponse {
  data: AtomoneStakingDelta[];
  cursor: AtomoneStakingDeltasCursor | null;
  has_more: boolean;
  total: string;
  meta: { skipped_ambiguous_msgexec: string };
}
