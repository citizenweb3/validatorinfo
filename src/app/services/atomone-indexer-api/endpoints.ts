import * as client from './client';
import {
  AtomoneBlockDetailResponse,
  AtomoneBlocksListResponse,
  AtomoneBlocksStatsResponse,
  AtomoneIndexerRequestOptions,
  AtomoneTxDetailResponse,
  AtomoneTxRawResponse,
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
