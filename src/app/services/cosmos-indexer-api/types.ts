export interface CosmosIndexerRequestOptions {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  timeout?: number;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface CosmosBlockSummary {
  block_hash: string;
  height: string;
  time: string;
  tx_count: number;
  proposer_address: string;
}

export interface CosmosBlockDetail extends CosmosBlockSummary {
  size_bytes: number | null;
  last_commit_hash: string | null;
  data_hash: string | null;
  app_hash: string | null;
  evidence_count: number;
}

export interface CosmosBlocksStats {
  total_blocks: string;
  last_height: string;
}

export interface CosmosTxFeeSummary {
  amount: string | null;
  denom: string | null;
}

export interface CosmosTxSummary {
  tx_hash: string;
  height: string;
  tx_index: number;
  time: string;
  code: number;
  first_msg_type: string | null;
  fee: CosmosTxFeeSummary | null;
}

export interface CosmosTxFeeAmount {
  amount: string;
  denom: string;
}

export interface CosmosTxFee {
  amount: CosmosTxFeeAmount[];
  gas_limit: string;
  payer: string;
  granter: string;
}

export interface CosmosTxMessage {
  msg_index: number;
  type_url: string;
  value: Record<string, unknown>;
  signer: string | null;
}

export interface CosmosTxEvent {
  msg_index: number;
  event_index: number;
  event_type: string;
  attributes: unknown;
}

export interface CosmosTxDetail {
  tx_hash: string;
  height: string;
  tx_index: number;
  time: string;
  code: number;
  gas_wanted: string | null;
  gas_used: string | null;
  fee: CosmosTxFee | null;
  memo: string | null;
  signers: string[] | null;
  log_summary: string | null;
  messages: CosmosTxMessage[];
  events: CosmosTxEvent[];
}

export interface CosmosTxsStats {
  total_txs: string;
  last_height: string;
}

export interface CosmosBlocksCursor {
  next_before_height: string;
}

export interface CosmosTxsCursor {
  next_before_height: string;
  next_before_index: number;
}

export interface CosmosDelegationEvent {
  delegator_address: string;
  amount: string;
  denom: string;
  height: string;
  tx_index: number;
  msg_index: number;
  tx_hash: string;
  time: string;
}

export interface CosmosDelegationsCursor {
  next_before_height: string;
  next_before_index: number;
  next_before_msg_index: number;
}

export interface CosmosListResponse<T, C = CosmosBlocksCursor | CosmosTxsCursor> {
  data: T[];
  cursor: C | null;
  has_more: boolean;
  total: string;
}

export type CosmosBlocksListResponse = CosmosListResponse<CosmosBlockSummary, CosmosBlocksCursor>;
export type CosmosTxsListResponse = CosmosListResponse<CosmosTxSummary, CosmosTxsCursor>;
export type CosmosDelegationsResponse = CosmosListResponse<CosmosDelegationEvent, CosmosDelegationsCursor>;

export interface CosmosBlockDetailResponse {
  data: CosmosBlockDetail;
}

export interface CosmosBlocksStatsResponse {
  data: CosmosBlocksStats;
}

export interface CosmosTxDetailResponse {
  data: CosmosTxDetail;
}

export interface CosmosTxRawResponse {
  data: {
    raw_tx: unknown;
  };
}

export interface CosmosTxsStatsResponse {
  data: CosmosTxsStats;
}

export type CosmosGovVoteOption = 'YES' | 'NO' | 'ABSTAIN' | 'VETO' | 'UNSPECIFIED';

export interface CosmosGovVote {
  proposal_id: string;
  option: CosmosGovVoteOption;
  weight: string | null;
  height: string;
  tx_hash: string;
}

export interface CosmosGovVotesCursor {
  next_before_proposal_id: string;
}

export type CosmosGovVotesResponse = CosmosListResponse<CosmosGovVote, CosmosGovVotesCursor>;

export interface CosmosCoverage {
  earliest_height: string;
  earliest_time: string;
}

export interface CosmosCoverageResponse {
  data: CosmosCoverage;
}

export type CosmosEarliestActivitySource = 'actor' | 'transfer_out' | 'transfer_in';

export interface CosmosEarliestActivity {
  height: string;
  tx_index: number;
  tx_hash: string;
  time: string;
  source: CosmosEarliestActivitySource;
}

export interface CosmosEarliestActivityResponse {
  data: {
    earliest: CosmosEarliestActivity | null;
    coverage: CosmosCoverage;
  };
}

export type CosmosStakingDeltaEventType =
  | 'delegate'
  | 'redelegate'
  | 'unbond'
  | 'create_validator'
  | 'cancel_unbonding_delegation';

export interface CosmosStakingDelta {
  height: string;
  tx_index: number;
  msg_index: number;
  tx_hash: string;
  time: string;
  event_type: CosmosStakingDeltaEventType;
  validator_src: string | null;
  validator_dst: string | null;
  denom: string;
  amount: string;
  sign: 1 | -1 | 0;
  source: 'event' | 'message';
}

export interface CosmosStakingDeltasCursor {
  next_before_height: string;
  next_before_index: number;
  next_before_msg_index: number;
}

export interface CosmosStakingDeltasResponse {
  data: CosmosStakingDelta[];
  cursor: CosmosStakingDeltasCursor | null;
  has_more: boolean;
  total: string;
  meta: { skipped_ambiguous_msgexec: string };
}
