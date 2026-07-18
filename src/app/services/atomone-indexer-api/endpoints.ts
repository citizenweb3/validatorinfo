import * as client from './client';
import {
  AtomoneBlockDetailResponse,
  AtomoneBlocksListResponse,
  AtomoneBlocksStatsResponse,
  AtomoneCoverageResponse,
  AtomoneDelegationsResponse,
  AtomoneEarliestActivityResponse,
  AtomoneGovVotesResponse,
  AtomoneIndexerRequestOptions,
  AtomoneStakingDeltasResponse,
  AtomoneTxDetailResponse,
  AtomoneTxRawResponse,
  AtomoneTxsByAddressListResponse,
  AtomoneTxsListResponse,
  AtomoneTxsStatsResponse,
} from './types';

export interface GetBlocksListParams {
  limit?: number;
  before_height?: string;
}

export const getBlocksList = (
  params: GetBlocksListParams = {},
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneBlocksListResponse> =>
  client.get<AtomoneBlocksListResponse>(
    '/api/v1/blocks',
    {
      limit: params.limit,
      before_height: params.before_height,
    },
    options,
  );

export const getBlockByHeight = (
  height: string | number | bigint,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneBlockDetailResponse> =>
  client.get<AtomoneBlockDetailResponse>(`/api/v1/blocks/height/${height}`, null, options);

export const getBlocksStats = (
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneBlocksStatsResponse> =>
  client.get<AtomoneBlocksStatsResponse>('/api/v1/blocks/stats', null, options);

export interface GetTxsListParams {
  limit?: number;
  before_height?: string;
  before_index?: number;
}

export const getTxsList = (
  params: GetTxsListParams = {},
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneTxsListResponse> =>
  client.get<AtomoneTxsListResponse>(
    '/api/v1/txs',
    {
      limit: params.limit,
      before_height: params.before_height,
      before_index: params.before_index,
    },
    options,
  );

export const getTxByHash = async (
  hash: string,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneTxDetailResponse | null> => {
  try {
    return await client.get<AtomoneTxDetailResponse>(`/api/v1/txs/${hash}`, null, options);
  } catch (e) {
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};

export const getTxRaw = async (
  hash: string,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneTxRawResponse | null> => {
  try {
    return await client.get<AtomoneTxRawResponse>(`/api/v1/txs/${hash}/raw`, null, options);
  } catch (e) {
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};

export const getTxsStats = (
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneTxsStatsResponse> =>
  client.get<AtomoneTxsStatsResponse>('/api/v1/txs/stats', null, options);

export interface GetGovVotesParams {
  voter: string;
  limit?: number;
  before_proposal_id?: string;
}

export const getGovVotes = (
  params: GetGovVotesParams,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneGovVotesResponse> =>
  client.get<AtomoneGovVotesResponse>(
    '/api/v1/gov/votes',
    {
      voter: params.voter,
      limit: params.limit,
      before_proposal_id: params.before_proposal_id,
    },
    options,
  );

export interface GetTxsByAddressParams {
  // comma-separated list of 1-5 bech32 addresses (e.g. account, or account+operator for a validator)
  address: string;
  limit?: number;
  before_height?: string;
  before_index?: number;
  msg_type?: string;
  from_time?: string;
  to_time?: string;
  min_amount?: string;
  max_amount?: string;
  amount_denom?: string;
  // 'false' skips the exact COUNT(*) `total` server-side. Cursor clients that don't read `total`
  // should pass 'false'. Ignored by older deployments (unknown params are stripped).
  count?: 'true' | 'false';
}

export const getTxsByAddress = (
  params: GetTxsByAddressParams,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneTxsByAddressListResponse> =>
  client.get<AtomoneTxsByAddressListResponse>(
    '/api/v1/txs/by-address',
    {
      address: params.address,
      limit: params.limit,
      before_height: params.before_height,
      before_index: params.before_index,
      msg_type: params.msg_type,
      from_time: params.from_time,
      to_time: params.to_time,
      min_amount: params.min_amount,
      max_amount: params.max_amount,
      amount_denom: params.amount_denom,
      count: params.count,
    },
    options,
  );

export interface GetDelegationsParams {
  validator: string;
  limit?: number;
  before_height?: string;
  before_index?: number;
  before_msg_index?: number;
}

export const getDelegations = (
  params: GetDelegationsParams,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneDelegationsResponse> =>
  client.get<AtomoneDelegationsResponse>(
    '/api/v1/staking/delegations',
    {
      validator: params.validator,
      limit: params.limit,
      before_height: params.before_height,
      before_index: params.before_index,
      before_msg_index: params.before_msg_index,
    },
    options,
  );

export const getCoverage = async (options?: AtomoneIndexerRequestOptions): Promise<AtomoneCoverageResponse | null> => {
  try {
    return await client.get<AtomoneCoverageResponse>('/api/v1/coverage', null, options);
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP 404')) return null;
    throw error;
  }
};

export const getEarliestActivity = async (
  address: string,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneEarliestActivityResponse | null> => {
  try {
    return await client.get<AtomoneEarliestActivityResponse>('/api/v1/address/earliest-activity', { address }, options);
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP 404')) return null;
    throw error;
  }
};

export interface GetStakingDeltasParams {
  delegator: string;
  limit?: number;
  before_height?: string;
  before_index?: number;
  before_msg_index?: number;
}

export const getStakingDeltas = (
  params: GetStakingDeltasParams,
  options?: AtomoneIndexerRequestOptions,
): Promise<AtomoneStakingDeltasResponse> =>
  client.get<AtomoneStakingDeltasResponse>(
    '/api/v1/staking/deltas',
    {
      delegator: params.delegator,
      limit: params.limit,
      before_height: params.before_height,
      before_index: params.before_index,
      before_msg_index: params.before_msg_index,
    },
    options,
  );
