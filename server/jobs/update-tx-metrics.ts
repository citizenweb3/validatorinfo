import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';

const { logInfo, logError, logWarn } = logger('tx-metrics');

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
  return delta >= BigInt(0) ? Number(delta) : null;
};

const processChain = async (chainName: string): Promise<void> => {
  const chain = await db.chain.findFirst({ where: { name: chainName } });

  if (!chain) {
    logWarn(`Chain '${chainName}' not found in DB, skipping`);
    return;
  }

  const methods = getChainMethods(chainName);

  const [totalTxsResult, txsLast24hResult] = await Promise.allSettled([
    methods.getTotalTxs(chain),
    methods.getTxsLast24h(chain),
  ]);

  if (totalTxsResult.status === 'rejected') {
    logError(`Failed to fetch totalTxs for ${chainName}: ${formatError(totalTxsResult.reason)}`);
  }
  if (txsLast24hResult.status === 'rejected') {
    logError(`Failed to fetch txsLast24h for ${chainName}: ${formatError(txsLast24hResult.reason)}`);
  }

  const totalTxs =
    totalTxsResult.status === 'fulfilled' && totalTxsResult.value !== null
      ? totalTxsResult.value
      : null;
  const txsLast24h =
    txsLast24hResult.status === 'fulfilled' && txsLast24hResult.value !== null
      ? txsLast24hResult.value
      : null;

  const [tpsResult, avgFeeResult] = await Promise.allSettled([
    methods.getTps(chain),
    methods.getAvgFee(chain),
  ]);

  if (tpsResult.status === 'rejected') {
    logError(`Failed to compute tps for ${chainName}: ${formatError(tpsResult.reason)}`);
  }
  if (avgFeeResult.status === 'rejected') {
    logError(`Failed to compute avgFee for ${chainName}: ${formatError(avgFeeResult.reason)}`);
  }

  if (totalTxs !== null) {
    const today = getUtcDate();
    await db.chainTxDailySnapshot.upsert({
      where: { chainId_snapshotAt: { chainId: chain.id, snapshotAt: today } },
      update: { totalTxs },
      create: {
        chainId: chain.id,
        snapshotAt: today,
        totalTxs,
      },
    });
  }

  const tps = tpsResult.status === 'fulfilled' ? tpsResult.value : null;
  const avgFee = avgFeeResult.status === 'fulfilled' ? avgFeeResult.value : null;

  if (totalTxs === null && txsLast24h === null && tps === null && avgFee === null) {
    return;
  }

  const update: {
    totalTxs?: bigint | null;
    txsLast24h?: number | null;
    tps?: number | null;
    avgFee?: string | null;
    txs30d?: number | null;
  } = {};

  if (totalTxs !== null) {
    update.totalTxs = totalTxs;
    update.txs30d = await resolveTxs30d(chain.id, totalTxs);
  }
  if (txsLast24h !== null) {
    update.txsLast24h = txsLast24h;
  }
  if (tps !== null) {
    update.tps = tps;
  }
  if (avgFeeResult.status === 'fulfilled') {
    update.avgFee = avgFee;
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

const updateTxMetrics = async (chainNames: string[]): Promise<void> => {
  logInfo('Starting tx metrics update');

  for (const chainName of chainNames) {
    try {
      await processChain(chainName);
    } catch (error) {
      logError(`Fatal error processing ${chainName}: ${formatError(error)}`);
    }
  }

  logInfo('Tx metrics update completed');
};

export default updateTxMetrics;
