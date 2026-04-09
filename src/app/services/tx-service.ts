import db from '@/db';
import aztecIndexer from '@/services/aztec-indexer-api';
import { getLatestFinalizedBlock } from '@/server/tools/chains/aztec/utils/get-latest-finalized-block';
import {
  AZTEC_INDEXER_MAX_BLOCK_RANGE,
  getAztecBlockHeight,
  getAztecTimestampMs,
  isAztecFinalizedStatus,
} from '@/utils/aztec';

export type TxStatus = 'pending' | 'confirmed' | 'dropped';

export interface TxItem {
  hash: string;
  status: TxStatus;
  blockHeight?: number;
  transactionFee?: string;
  timestamp?: number;
  feePayer?: string;
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
const TPS_BLOCK_WINDOW = AZTEC_INDEXER_MAX_BLOCK_RANGE;

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

const getAztecTxs = async (currentPage: number, perPage: number): Promise<TxsResponse> => {
  try {
    // Fetch pending txs and total count in parallel
    const [pendingTxs, totalCount] = await Promise.all([
      currentPage === 1 ? aztecIndexer.getPendingTxs({}, { cache: 'no-store' }) : Promise.resolve([]),
      aztecIndexer.getTotalTxEffects(TX_LIST_CACHE),
    ]);

    const pendingItems: TxItem[] = pendingTxs.map((tx) => ({
      hash: tx.txHash,
      status: 'pending' as const,
      timestamp: tx.birthTimestamp,
      feePayer: tx.feePayer,
    }));

    // On page 1: pending fill top slots, confirmed fill the rest
    // On other pages: only confirmed
    const pendingCount = currentPage === 1 ? pendingItems.length : 0;
    const confirmedSlotsOnPage = perPage - pendingCount;

    if (confirmedSlotsOnPage <= 0) {
      // Entire page is pending txs (unlikely but handle it)
      const totalPages = Math.max(1, Math.ceil((totalCount + pendingCount) / perPage));
      return { txs: pendingItems.slice(0, perPage), totalPages };
    }

    const totalPages = Math.ceil((totalCount + pendingCount) / perPage);

    if (totalCount === 0) {
      return { txs: pendingItems, totalPages: Math.max(1, totalPages) };
    }

    // For confirmed txs: adjust offset to account for pending slots on page 1
    const confirmedOffset = currentPage === 1
      ? 0
      : (currentPage - 1) * perPage - pendingCount;
    const batchIndex = Math.floor(confirmedOffset / ITEMS_PER_BATCH);
    const offsetInBatch = confirmedOffset % ITEMS_PER_BATCH;

    // Walk backward from latest blocks, batch by batch, using `to` cursor.
    let batch = await aztecIndexer.getUiTxEffects({}, TX_LIST_CACHE);

    for (let i = 0; i < batchIndex && batch.length > 0; i++) {
      const lowestBlock = Math.min(...batch.map((tx) => Number(tx.blockNumber)));
      batch = await aztecIndexer.getUiTxEffects({ to: lowestBlock }, TX_LIST_CACHE);
    }

    const pageTxEffects = batch.slice(offsetInBatch, offsetInBatch + confirmedSlotsOnPage);
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

    return {
      txs: [...pendingItems, ...confirmedItems],
      totalPages: Math.max(1, totalPages),
    };
  } catch (error) {
    console.error('Failed to fetch Aztec transactions:', error);
    return { txs: [], totalPages: 1, error: true };
  }
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

const getTxsByChainName = async (
  chainName: string,
  currentPage: number = 1,
  perPage: number = 20,
): Promise<TxsResponse> => {
  const normalizedChainName = chainName.toLowerCase();

  if (normalizedChainName === 'aztec') {
    return getAztecTxs(currentPage, perPage);
  }

  return { txs: [], totalPages: 1 };
};

const toBigIntValue = (value: string | number | bigint): bigint => {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value));
  }

  return BigInt(value);
};

const calculateAztecTps = async (): Promise<number | null> => {
  try {
    const latestFinalizedBlock = await getLatestFinalizedBlock();
    const latestFinalizedHeight = getAztecBlockHeight(latestFinalizedBlock.height);
    const from = Math.max(1, latestFinalizedHeight - TPS_BLOCK_WINDOW + 1);

    const recentBlocks = await aztecIndexer.getUiBlocksStrict(
      { from, to: latestFinalizedHeight },
      { cache: 'no-store' },
    );

    const finalizedBlocks = recentBlocks
      .filter((block) => isAztecFinalizedStatus(block.blockStatus))
      .sort((left, right) => Number(left.height) - Number(right.height));

    if (finalizedBlocks.length === 0) {
      return null;
    }

    const totalTxs = finalizedBlocks.reduce((sum, block) => sum + Number(block.txEffectsLength || 0), 0);
    if (finalizedBlocks.length === 1) {
      return totalTxs;
    }

    const firstTimestamp = getAztecTimestampMs(finalizedBlocks[0].timestamp);
    const lastTimestamp = getAztecTimestampMs(finalizedBlocks[finalizedBlocks.length - 1].timestamp);
    const elapsedSeconds = Math.max((lastTimestamp - firstTimestamp) / 1000, 1);

    return totalTxs / elapsedSeconds;
  } catch (error) {
    console.error('Failed to calculate Aztec TPS:', error);
    return null;
  }
};

const calculateAztecAverageFee = async (): Promise<string | null> => {
  try {
    const recentTxEffects = await aztecIndexer.getTxEffects({ cache: 'no-store' });
    const confirmedTxEffects = recentTxEffects.filter((tx) => !tx.isOrphaned);

    if (confirmedTxEffects.length === 0) {
      return null;
    }

    const totalFees = confirmedTxEffects.reduce((sum, tx) => {
      return sum + toBigIntValue(tx.transactionFee);
    }, BigInt(0));

    return (totalFees / BigInt(confirmedTxEffects.length)).toString();
  } catch (error) {
    console.error('Failed to calculate Aztec average fee:', error);
    return null;
  }
};

const getAztecTxMetrics = async (chainId: number): Promise<TxMetrics> => {
  const cached = await db.chainTxMetrics.findUnique({
    where: { chainId },
  });

  try {
    const [totalTxs, txsLast24h, tps, avgFee] = await Promise.all([
      aztecIndexer.getTotalTxEffects({ cache: 'no-store' }),
      aztecIndexer.getTxEffectsLast24h({ cache: 'no-store' }),
      calculateAztecTps(),
      calculateAztecAverageFee(),
    ]);

    const metrics: TxMetrics = {
      totalTxs: totalTxs || null,
      txsLast24h: txsLast24h || null,
      txs30d: null,
      tps,
      avgFee,
    };

    await db.chainTxMetrics.upsert({
      where: { chainId },
      update: {
        totalTxs: metrics.totalTxs ? BigInt(metrics.totalTxs) : null,
        txsLast24h: metrics.txsLast24h,
        tps: metrics.tps,
        avgFee: metrics.avgFee,
      },
      create: {
        chainId,
        totalTxs: metrics.totalTxs ? BigInt(metrics.totalTxs) : null,
        txsLast24h: metrics.txsLast24h,
        tps: metrics.tps,
        avgFee: metrics.avgFee,
      },
    });

    return metrics;
  } catch (error) {
    console.error('Failed to fetch Aztec tx metrics:', error);

    if (cached) {
      return {
        totalTxs: cached.totalTxs ? Number(cached.totalTxs) : null,
        txsLast24h: cached.txsLast24h,
        txs30d: cached.txs30d,
        tps: cached.tps,
        avgFee: cached.avgFee,
      };
    }

    return {
      totalTxs: null,
      txsLast24h: null,
      txs30d: null,
      tps: null,
      avgFee: null,
    };
  }
};

const TxService = {
  getTxsByChainName,
  getAztecTxs,
  getAztecTxByHash,
  getAztecTxMetrics,
};

export default TxService;
