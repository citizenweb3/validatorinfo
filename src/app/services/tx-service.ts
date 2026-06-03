import db from '@/db';
import atomoneIndexer from '@/services/atomone-indexer-api';
import { AtomoneTxDetail } from '@/services/atomone-indexer-api';
import aztecIndexer from '@/services/aztec-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import { CosmosTxDetail } from '@/services/cosmos-indexer-api';
import logosIndexer from '@/services/logos-indexer-api';
import { LogosTxDetail } from '@/services/logos-indexer-api';
import midenIndexer from '@/services/miden-indexer-api';
import { MidenTxDetail } from '@/services/miden-indexer-api';
import { refreshChainTxMetrics } from '@/server/jobs/update-tx-metrics';
import { getAztecTimestampMs } from '@/utils/aztec';

export type TxStatus = 'pending' | 'confirmed' | 'dropped';

export interface TxItem {
  hash: string;
  status: TxStatus;
  blockHeight?: number;
  transactionFee?: string;
  timestamp?: number;
  feePayer?: string;
  // Logos-specific
  opType?: string;
  opCount?: number;
  slot?: number;
  blockId?: string;
  // Miden-specific: bech32-encoded account that submitted the tx.
  accountId?: string;
}

export interface TxsResponse {
  txs: TxItem[];
  totalPages: number;
  error?: boolean;
}

export interface TxMetrics {
  totalTxs: number | null;
  txsLast24h: number | null;
  txs30d: number | null;
  tps: number | null;
  avgFee: string | null;
}

/** API returns up to 100 tx-effects per request */
const ITEMS_PER_BATCH = 100;

/** Short cache for tx list — reduces indexer load under high traffic */
const TX_LIST_CACHE = { revalidate: 3 };

const getAztecConfirmedBlockTimestamps = async (blockHeights: number[]): Promise<Map<number, number>> => {
  const uniqueBlockHeights = Array.from(
    new Set(blockHeights.filter((height) => Number.isFinite(height) && height > 0)),
  );

  if (uniqueBlockHeights.length === 0) {
    return new Map();
  }

  const results = await Promise.allSettled(
    uniqueBlockHeights.map(async (height) => {
      const block = await aztecIndexer.getBlockByHeightStrict(height, TX_LIST_CACHE);

      return {
        height,
        timestamp: getAztecTimestampMs(block.header.globalVariables.timestamp),
      };
    }),
  );

  const timestamps = new Map<number, number>();

  results.forEach((result) => {
    if (result.status !== 'fulfilled') {
      return;
    }

    timestamps.set(result.value.height, result.value.timestamp);
  });

  return timestamps;
};

const getAztecPendingTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    const pendingTxs = await aztecIndexer.getPendingTxs({}, { cache: 'no-store' });

    const sorted = [...pendingTxs].sort((a, b) => (b.birthTimestamp ?? 0) - (a.birthTimestamp ?? 0));
    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const offset = (currentPage - 1) * perPage;

    const pageItems: TxItem[] = sorted.slice(offset, offset + perPage).map((tx) => ({
      hash: tx.txHash,
      status: 'pending' as const,
      timestamp: tx.birthTimestamp,
      feePayer: tx.feePayer,
    }));

    return { txs: pageItems, totalPages };
  } catch (error) {
    console.error('Failed to fetch Aztec pending transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
};

const getAztecConfirmedTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    const totalCount = await aztecIndexer.getTotalTxEffects(TX_LIST_CACHE);
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

    if (totalCount === 0) {
      return { txs: [], totalPages };
    }

    const confirmedOffset = (currentPage - 1) * perPage;
    const batchIndex = Math.floor(confirmedOffset / ITEMS_PER_BATCH);
    const offsetInBatch = confirmedOffset % ITEMS_PER_BATCH;

    // Walk backward from latest blocks, batch by batch, using `to` cursor.
    let batch = await aztecIndexer.getUiTxEffects({}, TX_LIST_CACHE);

    for (let i = 0; i < batchIndex && batch.length > 0; i++) {
      const lowestBlock = Math.min(...batch.map((tx) => Number(tx.blockNumber)));
      batch = await aztecIndexer.getUiTxEffects({ to: lowestBlock }, TX_LIST_CACHE);
    }

    const pageTxEffects = batch.slice(offsetInBatch, offsetInBatch + perPage);
    const confirmedBlockTimestamps = await getAztecConfirmedBlockTimestamps(
      pageTxEffects.map((tx) => Number(tx.blockNumber)),
    );

    const confirmedItems: TxItem[] = pageTxEffects.map((tx) => ({
      blockHeight: Number(tx.blockNumber),
      hash: tx.txHash,
      status: 'confirmed' as const,
      transactionFee: String(tx.transactionFee),
      timestamp: confirmedBlockTimestamps.get(Number(tx.blockNumber)),
    }));

    return { txs: confirmedItems, totalPages };
  } catch (error) {
    console.error('Failed to fetch Aztec transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
};

const getAztecTxs = async (
  currentPage: number,
  perPage: number,
  showPending = false,
): Promise<TxsResponse> => {
  return showPending ? getAztecPendingTxs(currentPage, perPage) : getAztecConfirmedTxs(currentPage, perPage);
};

/** Shorter timeout for cascading hash lookups (default 30s is too long for 3 sequential calls) */
const TX_LOOKUP_TIMEOUT = 5000;

/**
 * Cascading tx lookup: confirmed → pending → dropped
 * Sequential with 5s timeout per step — worst case 15s instead of 90s.
 */
const getAztecTxByHash = async (hash: string): Promise<{ status: TxStatus; data: unknown } | null> => {
  const opts = { cache: 'no-store' as const, timeout: TX_LOOKUP_TIMEOUT };

  // 1. Try confirmed (most common — user clicked from tx list)
  const txEffect = await aztecIndexer.getTxEffectByHash(hash, opts).catch(() => null);
  if (txEffect) {
    return { status: 'confirmed', data: txEffect };
  }

  // 2. Try pending (mempool)
  const pendingTx = await aztecIndexer.getPendingTx(hash, opts).catch(() => null);
  if (pendingTx) {
    return { status: 'pending', data: pendingTx };
  }

  // 3. Try dropped
  const droppedTx = await aztecIndexer.getDroppedTx(hash, opts).catch(() => null);
  if (droppedTx) {
    return { status: 'dropped', data: droppedTx };
  }

  return null;
};

const formatLogosOpTypes = (opTypes: string[] | undefined): string | undefined => {
  if (!opTypes || opTypes.length === 0) {
    return undefined;
  }

  if (opTypes.length === 1) {
    return opTypes[0];
  }

  return `${opTypes[0]} +${opTypes.length - 1}`;
};

/**
 * Logos: list confirmed+pending transactions (finalized=all). API returns latest first by `height`.
 * Total page count comes from `stats.total_transactions`.
 */
const getLogosTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    const offset = (currentPage - 1) * perPage;
    const [{ data, pagination }, stats] = await Promise.all([
      logosIndexer.getTransactions(
        { finalized: 'all', limit: perPage, offset, sort: 'height', order: 'desc' },
        TX_LIST_CACHE,
      ),
      logosIndexer.getStats(TX_LIST_CACHE),
    ]);

    const totalFromStats = stats?.total_transactions
      ? Math.max(1, Math.ceil(stats.total_transactions / perPage))
      : 0;
    const totalFromHasMore = pagination.has_more ? currentPage + 1 : currentPage;
    const totalPages = Math.max(1, totalFromStats, totalFromHasMore);

    const txs: TxItem[] = data.map((tx) => ({
      hash: tx.id,
      status: tx.finalized ? 'confirmed' : 'pending',
      blockHeight: tx.height ?? undefined,
      blockId: tx.block_id,
      slot: tx.slot,
      timestamp: new Date(tx.indexed_at).getTime(),
      opCount: tx.op_count,
      opType: formatLogosOpTypes(tx.op_types),
    }));

    return { txs, totalPages };
  } catch (error) {
    console.error('Failed to fetch Logos transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
};

const getLogosTxByHash = async (
  id: string,
): Promise<{ status: TxStatus; data: LogosTxDetail } | null> => {
  const tx = await logosIndexer.getTransaction(id, { cache: 'no-store' }).catch(() => null);
  if (!tx) {
    return null;
  }

  return { status: tx.finalized ? 'confirmed' : 'pending', data: tx };
};

const TX_METRICS_TTL_MS = 60 * 60 * 1000;
const txMetricsRefreshInFlight = new Map<string, Promise<void>>();

const refreshTxMetricsOnce = (chainName: string): Promise<void> => {
  const existing = txMetricsRefreshInFlight.get(chainName);
  if (existing) {
    return existing;
  }
  const promise = refreshChainTxMetrics(chainName).finally(() => {
    txMetricsRefreshInFlight.delete(chainName);
  });
  txMetricsRefreshInFlight.set(chainName, promise);
  return promise;
};

const EMPTY_TX_METRICS: TxMetrics = {
  totalTxs: null,
  txsLast24h: null,
  txs30d: null,
  tps: null,
  avgFee: null,
};

const projectTxMetricsRow = (row: {
  totalTxs: bigint | null;
  txsLast24h: number | null;
  txs30d: number | null;
  tps: number | null;
  avgFee: string | null;
}): TxMetrics => ({
  totalTxs: row.totalTxs ? Number(row.totalTxs) : null,
  txsLast24h: row.txsLast24h,
  txs30d: row.txs30d,
  tps: row.tps,
  avgFee: row.avgFee,
});

const readTxMetrics = async (chainId: number, chainName: string): Promise<TxMetrics> => {
  let cached = await db.chainTxMetrics.findUnique({ where: { chainId } });

  const isStale =
    !cached || Date.now() - cached.updatedAt.getTime() > TX_METRICS_TTL_MS;

  if (isStale) {
    try {
      await refreshTxMetricsOnce(chainName);
      cached = await db.chainTxMetrics.findUnique({ where: { chainId } });
    } catch (error) {
      console.error(`Live tx-metrics refresh failed for ${chainName}:`, error);
    }
  }

  return cached ? projectTxMetricsRow(cached) : EMPTY_TX_METRICS;
};

const getLogosTxMetrics = (chainId: number, chainName: string): Promise<TxMetrics> =>
  readTxMetrics(chainId, chainName);

/**
 * Miden: list transactions sorted by block_num desc. Total page count comes from
 * the response's `total` field (falling back to `stats.total_transactions` if absent).
 */
const getMidenTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    const offset = (currentPage - 1) * perPage;
    const [{ data, total }, stats] = await Promise.all([
      midenIndexer.getTransactions(
        { limit: perPage, offset, sort: 'block_num', order: 'desc' },
        TX_LIST_CACHE,
      ),
      midenIndexer.getStats(TX_LIST_CACHE),
    ]);

    const isValidCount = (n: unknown): n is number =>
      typeof n === 'number' && Number.isFinite(n) && n >= 0;
    const totalCount = isValidCount(total)
      ? total
      : isValidCount(stats?.total_transactions)
        ? stats.total_transactions
        : 0;
    // If the indexer's stats cache is stale (total === 0 while data has items),
    // fall back to a data-length signal so the user isn't locked on page 1.
    const totalFromData = data.length === perPage ? currentPage + 1 : currentPage;
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage), totalFromData);

    // Prefer on-chain production time (block_timestamp, added upstream 2026-06-03);
    // fall back to inserted_at for cached pre-fix rows that lack the field.
    const txs: TxItem[] = data.map((tx) => ({
      hash: tx.tx_id,
      status: 'confirmed' as const,
      blockHeight: tx.block_num,
      timestamp: new Date(tx.block_timestamp ?? tx.inserted_at).getTime(),
      accountId: tx.account_id_bech32,
    }));

    return { txs, totalPages };
  } catch (error) {
    console.error('Failed to fetch Miden transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
};

const getMidenTxByHash = async (
  txId: string,
): Promise<{ status: TxStatus; data: MidenTxDetail } | null> => {
  let tx;
  try {
    tx = await midenIndexer.getTransaction(txId, { cache: 'no-store' });
  } catch (e) {
    console.error('Failed to fetch Miden transaction by hash:', e);
    return null;
  }
  if (!tx) {
    return null;
  }

  return { status: 'confirmed', data: tx };
};

// Miden v1 indexer does not surface per-tx fees; avgFee stays null in the row.
// Uses the shared stale-TTL refresh (1h + in-flight dedup), same as the other chains.
const getMidenTxMetrics = (chainId: number, chainName: string): Promise<TxMetrics> =>
  readTxMetrics(chainId, chainName);

/**
 * Cosmoshub: keyset cursor is forward-only (`before_height` + `before_index`).
 * For arbitrary `currentPage` we walk forward in chunks of `perPage` until reaching the offset,
 * then fetch the page. O(currentPage) — acceptable for typical UI usage; deep pages are slow.
 */
const getCosmosTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    const stats = await cosmosIndexer.getTxsStats(TX_LIST_CACHE);
    const total = Number(stats.data.total_txs);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const skip = (currentPage - 1) * perPage;

    let cursor: { before_height?: string; before_index?: number } | undefined;
    let walked = 0;

    while (walked < skip) {
      const step = Math.min(perPage, skip - walked);
      const r = await cosmosIndexer.getTxsList({ limit: step, ...cursor }, TX_LIST_CACHE);

      if (!r.has_more || !r.cursor) {
        break;
      }

      cursor = {
        before_height: r.cursor.next_before_height,
        before_index: 'next_before_index' in r.cursor ? r.cursor.next_before_index : undefined,
      };
      walked += r.data.length;
    }

    const page = await cosmosIndexer.getTxsList({ limit: perPage, ...cursor }, TX_LIST_CACHE);

    const txs: TxItem[] = page.data.map((t) => ({
      hash: t.tx_hash,
      // `code !== 0` in Cosmos means the tx is included in the block but execution failed.
      // We surface that as 'dropped' since `TxStatus` has no 'failed' member.
      status: t.code === 0 ? ('confirmed' as const) : ('dropped' as const),
      blockHeight: Number(t.height),
      timestamp: new Date(t.time).getTime(),
      transactionFee: t.fee?.amount ?? undefined,
      opType: t.first_msg_type ?? undefined,
    }));

    return { txs, totalPages };
  } catch (error) {
    console.error('Failed to fetch Cosmos transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
};

const getCosmosTxByHash = async (
  hash: string,
): Promise<{ status: TxStatus; data: CosmosTxDetail } | null> => {
  const tx = await cosmosIndexer.getTxByHash(hash, { cache: 'no-store' }).catch(() => null);

  if (!tx) {
    return null;
  }

  return {
    status: tx.data.code === 0 ? 'confirmed' : 'dropped',
    data: tx.data,
  };
};

const getCosmosTxMetrics = (chainId: number, chainName: string): Promise<TxMetrics> =>
  readTxMetrics(chainId, chainName);

/**
 * AtomOne uses the same citizenweb3 indexer shape as CosmosHub: keyset cursor
 * forward-only via `before_height` + `before_index`.
 */
const getAtomoneTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    const stats = await atomoneIndexer.getTxsStats(TX_LIST_CACHE);
    const total = Number(stats.data.total_txs);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const skip = (currentPage - 1) * perPage;

    let cursor: { before_height?: string; before_index?: number } | undefined;
    let walked = 0;

    while (walked < skip) {
      const step = Math.min(perPage, skip - walked);
      const r = await atomoneIndexer.getTxsList({ limit: step, ...cursor }, TX_LIST_CACHE);

      if (!r.has_more || !r.cursor) {
        break;
      }

      cursor = {
        before_height: r.cursor.next_before_height,
        before_index: 'next_before_index' in r.cursor ? r.cursor.next_before_index : undefined,
      };
      walked += r.data.length;
    }

    const page = await atomoneIndexer.getTxsList({ limit: perPage, ...cursor }, TX_LIST_CACHE);

    const txs: TxItem[] = page.data.map((t) => ({
      hash: t.tx_hash,
      status: t.code === 0 ? ('confirmed' as const) : ('dropped' as const),
      blockHeight: Number(t.height),
      timestamp: new Date(t.time).getTime(),
      transactionFee: t.fee?.amount ?? undefined,
      opType: t.first_msg_type ?? undefined,
    }));

    return { txs, totalPages };
  } catch (error) {
    console.error('Failed to fetch AtomOne transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
};

const getAtomoneTxByHash = async (
  hash: string,
): Promise<{ status: TxStatus; data: AtomoneTxDetail } | null> => {
  const tx = await atomoneIndexer.getTxByHash(hash, { cache: 'no-store' }).catch(() => null);

  if (!tx) {
    return null;
  }

  return {
    status: tx.data.code === 0 ? 'confirmed' : 'dropped',
    data: tx.data,
  };
};

const getAtomoneTxMetrics = (chainId: number, chainName: string): Promise<TxMetrics> =>
  readTxMetrics(chainId, chainName);

const getTxsByChainName = async (
  chainName: string,
  currentPage: number = 1,
  perPage: number = 20,
  showPending: boolean = false,
): Promise<TxsResponse> => {
  const normalizedChainName = chainName.toLowerCase();

  if (normalizedChainName === 'aztec') {
    return getAztecTxs(currentPage, perPage, showPending);
  }

  if (normalizedChainName === 'logos-testnet') {
    return getLogosTxs(currentPage, perPage);
  }

  if (normalizedChainName === 'miden-testnet') {
    return getMidenTxs(currentPage, perPage);
  }

  if (normalizedChainName === 'cosmoshub') {
    return getCosmosTxs(currentPage, perPage);
  }

  if (normalizedChainName === 'atomone') {
    return getAtomoneTxs(currentPage, perPage);
  }

  return { txs: [], totalPages: 1 };
};

const getAztecTxMetrics = (chainId: number, chainName: string): Promise<TxMetrics> =>
  readTxMetrics(chainId, chainName);

const TxService = {
  getTxsByChainName,
  getAztecTxs,
  getAztecTxByHash,
  getAztecTxMetrics,
  getLogosTxs,
  getLogosTxByHash,
  getLogosTxMetrics,
  getMidenTxs,
  getMidenTxByHash,
  getMidenTxMetrics,
  getCosmosTxs,
  getCosmosTxByHash,
  getCosmosTxMetrics,
  getAtomoneTxs,
  getAtomoneTxByHash,
  getAtomoneTxMetrics,
};

export default TxService;
