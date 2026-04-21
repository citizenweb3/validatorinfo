import db from '@/db';
import logger from '@/logger';
import aztecIndexer from '@/services/aztec-indexer-api';
import {
  calculateAztecAverageFee,
  calculateAztecTps,
} from '@/server/jobs/utils/aztec-tx-metrics';

const { logInfo, logError, logWarn } = logger('update-aztec-tx-metrics');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;
const SNAPSHOT_LOOKBACK_DAYS = 30;

const getUtcDate = (): Date => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
};

const getSnapshotCutoffDate = (): Date => {
  const cutoff = getUtcDate();
  cutoff.setUTCDate(cutoff.getUTCDate() - SNAPSHOT_LOOKBACK_DAYS);
  return cutoff;
};

const formatError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const resolveTxs30d = async (
  chainId: number,
  currentTotalTxs: bigint | null,
): Promise<number | null> => {
  if (currentTotalTxs === null) {
    return null;
  }

  const cutoffDate = getSnapshotCutoffDate();

  const targetSnapshot = await db.chainTxDailySnapshot.findUnique({
    where: { chainId_snapshotAt: { chainId, snapshotAt: cutoffDate } },
  });

  const referenceSnapshot =
    targetSnapshot ??
    (await db.chainTxDailySnapshot.findFirst({
      where: { chainId },
      orderBy: { snapshotAt: 'asc' },
    }));

  if (!referenceSnapshot) {
    return null;
  }

  const delta = currentTotalTxs - referenceSnapshot.totalTxs;
  // Guard against any decreasing-totals anomaly from the indexer.
  return delta >= BigInt(0) ? Number(delta) : null;
};

const processChain = async (chainName: string): Promise<void> => {
  const chain = await db.chain.findFirst({ where: { name: chainName } });

  if (!chain) {
    logWarn(`Chain '${chainName}' not found in DB, skipping`);
    return;
  }

  const [totalTxsResult, txsLast24hResult, tpsResult, avgFeeResult] = await Promise.allSettled([
    aztecIndexer.getTotalTxEffects({ cache: 'no-store' }),
    aztecIndexer.getTxEffectsLast24h({ cache: 'no-store' }),
    calculateAztecTps(),
    calculateAztecAverageFee(),
  ]);

  if (totalTxsResult.status === 'rejected') {
    logError(`Failed to fetch totalTxs for ${chainName}: ${formatError(totalTxsResult.reason)}`);
  }
  if (txsLast24hResult.status === 'rejected') {
    logError(`Failed to fetch txsLast24h for ${chainName}: ${formatError(txsLast24hResult.reason)}`);
  }
  if (tpsResult.status === 'rejected') {
    logError(`Failed to compute tps for ${chainName}: ${formatError(tpsResult.reason)}`);
  }
  if (avgFeeResult.status === 'rejected') {
    logError(`Failed to compute avgFee for ${chainName}: ${formatError(avgFeeResult.reason)}`);
  }

  const totalTxsFulfilled =
    totalTxsResult.status === 'fulfilled' && totalTxsResult.value !== null && totalTxsResult.value !== undefined;
  const currentTotalTxsBigInt: bigint | null = totalTxsFulfilled
    ? BigInt(totalTxsResult.value)
    : null;

  if (currentTotalTxsBigInt !== null) {
    const today = getUtcDate();
    await db.chainTxDailySnapshot.upsert({
      where: { chainId_snapshotAt: { chainId: chain.id, snapshotAt: today } },
      update: { totalTxs: currentTotalTxsBigInt },
      create: {
        chainId: chain.id,
        snapshotAt: today,
        totalTxs: currentTotalTxsBigInt,
      },
    });
  }

  const update: {
    totalTxs?: bigint | null;
    txsLast24h?: number | null;
    tps?: number | null;
    avgFee?: string | null;
    txs30d?: number | null;
  } = {};

  if (totalTxsFulfilled) {
    update.totalTxs = currentTotalTxsBigInt;
    // txs30d is derived from totalTxs — only compute/write when totalTxs is fresh.
    update.txs30d = await resolveTxs30d(chain.id, currentTotalTxsBigInt);
  }
  if (txsLast24hResult.status === 'fulfilled') {
    update.txsLast24h =
      txsLast24hResult.value !== null && txsLast24hResult.value !== undefined
        ? txsLast24hResult.value
        : null;
  }
  if (tpsResult.status === 'fulfilled') {
    update.tps = tpsResult.value;
  }
  if (avgFeeResult.status === 'fulfilled') {
    update.avgFee = avgFeeResult.value;
  }

  await db.chainTxMetrics.upsert({
    where: { chainId: chain.id },
    update,
    create: {
      chainId: chain.id,
      totalTxs: update.totalTxs ?? null,
      txsLast24h: update.txsLast24h ?? null,
      tps: update.tps ?? null,
      avgFee: update.avgFee ?? null,
      txs30d: update.txs30d ?? null,
    },
  });

  logInfo(
    `${chainName}: totalTxs=${update.totalTxs ?? 'skip'}, txsLast24h=${update.txsLast24h ?? 'skip'}, ` +
      `tps=${update.tps ?? 'skip'}, avgFee=${update.avgFee ?? 'skip'}, txs30d=${update.txs30d ?? 'skip'}`,
  );
};

const updateAztecTxMetrics = async (): Promise<void> => {
  logInfo('Starting Aztec tx metrics update');

  for (const chainName of AZTEC_CHAINS) {
    try {
      await processChain(chainName);
    } catch (error) {
      logError(`Fatal error processing ${chainName}: ${formatError(error)}`);
    }
  }

  logInfo('Aztec tx metrics update completed');
};

export default updateAztecTxMetrics;
