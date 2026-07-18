import 'server-only';

import { atomoneIndexer } from '@/services/atomone-indexer-api';
import { cosmosIndexer } from '@/services/cosmos-indexer-api';
import { CACHE_KEYS, CACHE_TTL, cacheGetOrFetch } from '@/services/redis-cache';
import { isTxByAddressChainSupported, toTxByAddressChain } from '@/utils/tx-supported-chains';

export interface TransferCursor {
  before_height: string;
  before_tx_hash: string;
  before_msg_index: number;
  before_from: string;
  before_to: string;
  before_denom: string;
}

export interface TransferFeedItem {
  height: string;
  txHash: string;
  msgIndex: number;
  fromAddr: string;
  toAddr: string;
  denom: string;
  amount: string;
  time: string;
}

export interface TransferFeedBatch {
  rows: TransferFeedItem[];
  nextCursor: TransferCursor | null;
  hasMore: boolean;
  error?: boolean;
}

const ITEMS_PER_BATCH = 100;

const EMPTY_BATCH: TransferFeedBatch = { rows: [], nextCursor: null, hasMore: false };
const ERROR_BATCH: TransferFeedBatch = { rows: [], nextCursor: null, hasMore: false, error: true };

// The two supported chains run the same indexer API, so the clients are structurally identical.
type TransfersClient = { getTransfersByAddress: typeof cosmosIndexer.getTransfersByAddress };

const TRANSFER_CLIENTS: Record<'cosmoshub' | 'atomone', TransfersClient> = {
  cosmoshub: cosmosIndexer,
  atomone: atomoneIndexer,
};

const fetchTransfersBatch = async (
  indexer: TransfersClient,
  address: string,
  cursor?: TransferCursor,
): Promise<TransferFeedBatch> => {
  const page = await indexer.getTransfersByAddress(
    {
      address,
      limit: ITEMS_PER_BATCH,
      before_height: cursor?.before_height,
      before_tx_hash: cursor?.before_tx_hash,
      before_msg_index: cursor?.before_msg_index,
      before_from: cursor?.before_from,
      before_to: cursor?.before_to,
      before_denom: cursor?.before_denom,
    },
    { cache: 'no-store' },
  );

  // null-guard: never restart from head if the API returns has_more with a null cursor.
  const nextCursor: TransferCursor | null =
    page.has_more && page.cursor
      ? {
          before_height: page.cursor.next_before_height,
          before_tx_hash: page.cursor.next_before_tx_hash,
          before_msg_index: page.cursor.next_before_msg_index,
          before_from: page.cursor.next_before_from,
          before_to: page.cursor.next_before_to,
          before_denom: page.cursor.next_before_denom,
        }
      : null;

  return {
    rows: page.data.map((entry) => ({
      height: entry.height,
      txHash: entry.tx_hash,
      msgIndex: entry.msg_index,
      fromAddr: entry.from_addr,
      toAddr: entry.to_addr,
      denom: entry.denom,
      amount: entry.amount,
      time: entry.time,
    })),
    nextCursor,
    hasMore: nextCursor !== null,
  };
};

const transfersInflight = new Map<string, Promise<TransferFeedBatch>>();

// Same read model as the tx feed: keyset cursor batches, Redis read-through (mutable head 15s,
// immutable deep pages 300s), in-process single-flight, and errors caught OUTSIDE the cache so
// a failed fetch is never stored and the next call retries.
const getTransfersByAddressBatch = (chainName: string, address: string, cursor?: TransferCursor): Promise<TransferFeedBatch> => {
  const chain = toTxByAddressChain(chainName);
  if (!chain || !address) return Promise.resolve(EMPTY_BATCH);

  const cursorKey = cursor
    ? `c:${cursor.before_height}:${cursor.before_tx_hash}:${cursor.before_msg_index}:${cursor.before_from}:${cursor.before_to}:${cursor.before_denom}`
    : 'head';
  const key = CACHE_KEYS.transfers.byAddress(chain, address, cursorKey);
  const ttl = cursor ? CACHE_TTL.TXS_DEEP : CACHE_TTL.TXS_HEAD;

  const existing = transfersInflight.get(key);
  if (existing) return existing;

  const promise = cacheGetOrFetch<TransferFeedBatch>(
    key,
    () => fetchTransfersBatch(TRANSFER_CLIENTS[chain], address, cursor),
    ttl,
  )
    .then((value) => value ?? EMPTY_BATCH)
    .catch(() => ERROR_BATCH)
    .finally(() => {
      transfersInflight.delete(key);
    });

  transfersInflight.set(key, promise);
  return promise;
};

export { isTxByAddressChainSupported as isTransferFeedChainSupported };

const TransferFeedService = { getTransfersByAddressBatch };

export default TransferFeedService;
