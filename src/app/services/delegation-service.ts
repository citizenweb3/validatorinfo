import { formatDistanceToNow } from 'date-fns';

import atomoneIndexer from '@/services/atomone-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import type { CosmosDelegationEvent } from '@/services/cosmos-indexer-api';
import { cacheGetOrFetch, CACHE_KEYS, CACHE_TTL } from '@/services/redis-cache';
import { getChainParams } from '@/server/tools/chains/params';
import { SortDirection } from '@/server/types';

export type DelegationSortBy = 'amount' | 'happened';

export interface DelegationSort {
  sortBy: DelegationSortBy;
  order: SortDirection;
}

export const DEFAULT_DELEGATION_SORT: DelegationSort = { sortBy: 'amount', order: 'desc' };

export interface DelegationCursor {
  before_height: string;
  before_index: number;
  before_msg_index: number;
  before_amount?: string;
}

export interface DelegationItem {
  address: string;
  amount: number;
  denom: string;
  happened: string;
  txHash: string;
  blockHeight: string;
}

export interface DelegationBatch {
  rows: DelegationItem[];
  nextCursor: DelegationCursor | null;
  hasMore: boolean;
  error?: true;
}

export type DelegationBatchResult =
  | { ok: true; rows: DelegationItem[]; nextCursor: DelegationCursor | null; hasMore: boolean }
  | { ok: false; code: 'INVALID_REQUEST' | 'SERVICE_ERROR' };

const ITEMS_PER_BATCH = 100;

const EMPTY_BATCH: DelegationBatch = { rows: [], nextCursor: null, hasMore: false };
const ERROR_BATCH: DelegationBatch = { rows: [], nextCursor: null, hasMore: false, error: true };

type DelegationsClient = { getDelegations: typeof cosmosIndexer.getDelegations };

const toDelegationItem = (
  event: CosmosDelegationEvent,
  coinDecimals: number,
  denom: string,
): DelegationItem => ({
  address: event.delegator_address,
  amount: Number(event.amount) / 10 ** coinDecimals,
  denom,
  happened: formatDistanceToNow(new Date(event.time), { addSuffix: true }),
  txHash: event.tx_hash,
  blockHeight: event.height,
});

const fetchDelegationsBatch = async (
  indexer: DelegationsClient,
  chainName: string,
  validator: string,
  sort: DelegationSort,
  cursor?: DelegationCursor,
): Promise<DelegationBatch> => {
  const { coinDecimals, denom } = getChainParams(chainName);
  const page = await indexer.getDelegations(
    {
      validator,
      limit: ITEMS_PER_BATCH,
      sort: sort.sortBy === 'amount' ? 'amount' : 'time',
      order: sort.order,
      before_amount: cursor?.before_amount,
      before_height: cursor?.before_height,
      before_index: cursor?.before_index,
      before_msg_index: cursor?.before_msg_index,
    },
    { cache: 'no-store' },
  );

  const hasMore = page.has_more && page.cursor != null;
  const nextCursor: DelegationCursor | null = hasMore
    ? {
        before_height: page.cursor!.next_before_height,
        before_index: page.cursor!.next_before_index,
        before_msg_index: page.cursor!.next_before_msg_index,
        ...(page.cursor!.next_before_amount !== undefined
          ? { before_amount: page.cursor!.next_before_amount }
          : {}),
      }
    : null;

  return {
    rows: page.data.map((event) => toDelegationItem(event, coinDecimals, denom)),
    nextCursor,
    hasMore,
  };
};

const delegationsInflight = new Map<string, Promise<DelegationBatch>>();

const runDelegationsBatch = (
  indexer: DelegationsClient,
  chainKey: string,
  validator: string,
  sort: DelegationSort,
  cursor?: DelegationCursor,
): Promise<DelegationBatch> => {
  if (!validator) return Promise.resolve(EMPTY_BATCH);

  // The sort mode prefixes the cache key: an amount-sorted head and a time-sorted head for the
  // same validator must never serve each other's cached batches.
  const cursorKey = [
    sort.sortBy,
    sort.order,
    cursor
      ? `c:${cursor.before_height}:${cursor.before_index}:${cursor.before_msg_index}${cursor.before_amount !== undefined ? `:${cursor.before_amount}` : ''}`
      : 'head',
  ].join(':');
  const key = CACHE_KEYS.delegations.byValidator(chainKey, validator, cursorKey);
  const ttl = cursor ? CACHE_TTL.TXS_DEEP : CACHE_TTL.TXS_HEAD;

  const existing = delegationsInflight.get(key);
  if (existing) return existing;

  const promise = cacheGetOrFetch<DelegationBatch>(
    key,
    () => fetchDelegationsBatch(indexer, chainKey, validator, sort, cursor),
    ttl,
  )
    .then((value) => value ?? EMPTY_BATCH)
    .catch(() => ERROR_BATCH)
    .finally(() => {
      delegationsInflight.delete(key);
    });

  delegationsInflight.set(key, promise);
  return promise;
};

const getDelegationsBatch = (
  chainName: string,
  validator: string,
  sort: DelegationSort = DEFAULT_DELEGATION_SORT,
  cursor?: DelegationCursor,
): Promise<DelegationBatch> => {
  const normalizedChainName = chainName.toLowerCase();

  if (normalizedChainName === 'cosmoshub') {
    return runDelegationsBatch(cosmosIndexer, 'cosmoshub', validator, sort, cursor);
  }

  if (normalizedChainName === 'atomone') {
    return runDelegationsBatch(atomoneIndexer, 'atomone', validator, sort, cursor);
  }

  return Promise.resolve(EMPTY_BATCH);
};

const DelegationService = {
  getDelegationsBatch,
};

export default DelegationService;
