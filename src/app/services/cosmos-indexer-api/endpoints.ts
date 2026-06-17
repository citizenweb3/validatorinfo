import * as client from './client';
import {
  CosmosBlockDetailResponse,
  CosmosBlocksListResponse,
  CosmosBlocksStatsResponse,
  CosmosGovVotesResponse,
  CosmosIndexerRequestOptions,
  CosmosTxDetailResponse,
  CosmosTxRawResponse,
  CosmosTxsListResponse,
  CosmosTxsStatsResponse,
} from './types';

export interface GetBlocksListParams {
  limit?: number;
  before_height?: string;
}

export const getBlocksList = (
  params: GetBlocksListParams = {},
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosBlocksListResponse> =>
  client.get<CosmosBlocksListResponse>(
    '/api/v1/blocks',
    {
      limit: params.limit,
      before_height: params.before_height,
    },
    options,
  );

export const getBlockByHeight = (
  height: string | number | bigint,
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosBlockDetailResponse> =>
  client.get<CosmosBlockDetailResponse>(`/api/v1/blocks/height/${height}`, null, options);

export const getBlocksStats = (
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosBlocksStatsResponse> =>
  client.get<CosmosBlocksStatsResponse>('/api/v1/blocks/stats', null, options);

export interface GetTxsListParams {
  limit?: number;
  before_height?: string;
  before_index?: number;
}

export const getTxsList = (
  params: GetTxsListParams = {},
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosTxsListResponse> =>
  client.get<CosmosTxsListResponse>(
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
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosTxDetailResponse | null> => {
  try {
    return await client.get<CosmosTxDetailResponse>(`/api/v1/txs/${hash}`, null, options);
  } catch (e) {
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};

export const getTxRaw = async (
  hash: string,
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosTxRawResponse | null> => {
  try {
    return await client.get<CosmosTxRawResponse>(`/api/v1/txs/${hash}/raw`, null, options);
  } catch (e) {
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};

export const getTxsStats = (
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosTxsStatsResponse> =>
  client.get<CosmosTxsStatsResponse>('/api/v1/txs/stats', null, options);

export interface GetGovVotesParams {
  voter: string;
  limit?: number;
  before_proposal_id?: string;
}

export const getGovVotes = (
  params: GetGovVotesParams,
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosGovVotesResponse> =>
  client.get<CosmosGovVotesResponse>(
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
  // 'false' skips the exact COUNT(*) `total` server-side (10–20s on a top validator). Cursor
  // clients that don't read `total` should pass 'false'. Ignored by older deployments (unknown
  // params are stripped), so it's safe to send before the indexer ships support.
  count?: 'true' | 'false';
}

export const getTxsByAddress = (
  params: GetTxsByAddressParams,
  options?: CosmosIndexerRequestOptions,
): Promise<CosmosTxsListResponse> =>
  client.get<CosmosTxsListResponse>(
    '/api/v1/txs/by-address',
    {
      address: params.address,
      limit: params.limit,
      before_height: params.before_height,
      before_index: params.before_index,
      count: params.count,
    },
    options,
  );
