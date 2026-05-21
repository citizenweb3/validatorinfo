import * as client from './client';
import { HttpError } from './client';
import {
  MidenBlock,
  MidenBlocksResponse,
  MidenIndexerRequestOptions,
  MidenStats,
  MidenTransactionsResponse,
  MidenTxDetail,
} from './types';

export const getStats = (options?: MidenIndexerRequestOptions): Promise<MidenStats> =>
  client.get<MidenStats>('/api/v1/stats', null, options);

export interface GetBlocksParams {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  sort?: 'block_num';
}

export const getBlocks = (
  params: GetBlocksParams = {},
  options?: MidenIndexerRequestOptions,
): Promise<MidenBlocksResponse> =>
  client.get<MidenBlocksResponse>(
    '/api/v1/blocks',
    {
      limit: params.limit,
      offset: params.offset,
      order: params.order,
      sort: params.sort,
    },
    options,
  );

export const getBlock = async (
  blockNum: string,
  options?: MidenIndexerRequestOptions,
): Promise<MidenBlock | null> => {
  try {
    return await client.get<MidenBlock>(`/api/v1/blocks/${encodeURIComponent(blockNum)}`, null, options);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return null;
    }
    throw e;
  }
};

export interface GetTransactionsParams {
  limit?: number;
  offset?: number;
  sort?: 'block_num' | 'inserted_at';
  order?: 'asc' | 'desc';
  account_id?: string;
}

export const getTransactions = (
  params: GetTransactionsParams = {},
  options?: MidenIndexerRequestOptions,
): Promise<MidenTransactionsResponse> =>
  client.get<MidenTransactionsResponse>(
    '/api/v1/transactions',
    {
      limit: params.limit,
      offset: params.offset,
      sort: params.sort,
      order: params.order,
      account_id: params.account_id,
    },
    options,
  );

export const getTransaction = async (
  txId: string,
  options?: MidenIndexerRequestOptions,
): Promise<MidenTxDetail | null> => {
  try {
    return await client.get<MidenTxDetail>(
      `/api/v1/transactions/${encodeURIComponent(txId)}`,
      null,
      options,
    );
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return null;
    }
    throw e;
  }
};
