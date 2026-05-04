import * as client from './client';
import {
  LogosBlock,
  LogosBlocksResponse,
  LogosIndexerRequestOptions,
  LogosStats,
  LogosTxDetail,
  LogosTxsResponse,
} from './types';

export const getStats = (options?: LogosIndexerRequestOptions): Promise<LogosStats> =>
  client.get<LogosStats>('/api/v1/stats', null, options);

export interface GetBlocksParams {
  finalized?: 'true' | 'false' | 'all';
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  sort?: 'height' | 'slot';
}

export const getBlocks = (
  params: GetBlocksParams = {},
  options?: LogosIndexerRequestOptions,
): Promise<LogosBlocksResponse> =>
  client.get<LogosBlocksResponse>(
    '/api/v1/blocks',
    {
      finalized: params.finalized ?? 'all',
      limit: params.limit,
      offset: params.offset,
      order: params.order,
      sort: params.sort,
    },
    options,
  );

export const getBlock = async (
  id: string,
  options?: LogosIndexerRequestOptions,
): Promise<LogosBlock | null> => {
  try {
    return await client.get<LogosBlock>(`/api/v1/blocks/${id}`, null, options);
  } catch (e) {
    // Indexer returns 404 for unknown ids — surface as null so callers can `notFound()`.
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};

export interface GetTransactionsParams {
  finalized?: 'true' | 'false' | 'all';
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  sort?: 'height' | 'slot';
  block_id?: string;
}

export const getTransactions = (
  params: GetTransactionsParams = {},
  options?: LogosIndexerRequestOptions,
): Promise<LogosTxsResponse> =>
  client.get<LogosTxsResponse>(
    '/api/v1/transactions',
    {
      finalized: params.finalized ?? 'all',
      limit: params.limit,
      offset: params.offset,
      order: params.order,
      sort: params.sort,
      block_id: params.block_id,
    },
    options,
  );

export const getTransaction = async (
  id: string,
  options?: LogosIndexerRequestOptions,
): Promise<LogosTxDetail | null> => {
  try {
    return await client.get<LogosTxDetail>(`/api/v1/transactions/${id}`, null, options);
  } catch (e) {
    if (e instanceof Error && e.message.includes('HTTP 404')) {
      return null;
    }
    throw e;
  }
};
