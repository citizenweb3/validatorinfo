import db from '@/db';
import logger from '@/logger';
import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';
import {
  UNKNOWN_POOL_NAME,
  UNKNOWN_POOL_SLUG,
} from '@/server/tools/chains/monero/attribution-source';
import { getTipBlock } from '@/server/tools/chains/monero/indexer-client';

const { logInfo, logError, logWarn } = logger('monero-pool-stats');

type WindowKind = '24h' | '7d' | '30d' | 'all';
const WINDOW_SECONDS: Record<Exclude<WindowKind, 'all'>, number> = {
  '24h': 86_400,
  '7d': 604_800,
  '30d': 2_592_000,
};
const WINDOWS: WindowKind[] = ['24h', '7d', '30d', 'all'];

/**
 * Monero pool-stats job (design §5.2).
 *
 * Counting is by BLOCK HEIGHT, not wall-clock, so numerator and denominator
 * share one clock (Codex/stats-H1). Monero heights are contiguous (exactly one
 * canonical block per height), so `networkBlocks = tipHeight − lowerHeight` is
 * the EXACT count of canonical network blocks in the window — not an estimate.
 * `poolBlocks` counts canonical, non-conflicted attributions in the same height
 * range. The residual is the honest unknown/solo bucket (clamped ≥ 0).
 *
 * Every named pool is upserted every run (including 0) so stale rows can never
 * survive a pool going quiet (stats-H2). hashrateEstimate uses the window-average
 * hashrate (hourly snapshots); omitted ('0') for the all window.
 */
const updateMoneroPoolStats = async (): Promise<void> => {
  logInfo('Starting Monero pool-stats update');

  try {
    const dbChain = await db.chain.findFirst({ where: { name: 'monero' } });
    if (!dbChain) {
      logWarn('Chain "monero" not found, skipping');
      return;
    }
    const chainId = dbChain.id;

    const tip = await getTipBlock();
    if (!tip || tip.height <= 0) {
      logWarn('No usable tip block, skipping');
      return;
    }
    const tipHeight = tip.height;

    const pools = await db.miningPool.findMany({ where: { chainId }, select: { id: true, slug: true } });
    let unknownId = pools.find((p) => p.slug === UNKNOWN_POOL_SLUG)?.id;
    if (unknownId === undefined) {
      const u = await db.miningPool.upsert({
        where: { chainId_slug: { chainId, slug: UNKNOWN_POOL_SLUG } },
        update: {},
        create: { chainId, slug: UNKNOWN_POOL_SLUG, name: UNKNOWN_POOL_NAME, identificationMethod: 'unknown', isVerified: false },
        select: { id: true },
      });
      unknownId = u.id;
    }
    const namedPools = pools.filter((p) => p.slug !== UNKNOWN_POOL_SLUG);

    const now = new Date();

    for (const window of WINDOWS) {
      // Height-based window bound + timestamps for the stored row.
      let lowerHeight: number;
      let windowStart: Date;
      const windowEnd = now;

      if (window === 'all') {
        const earliest = await db.moneroBlockAttribution.findFirst({
          where: { chainId },
          orderBy: { height: 'asc' },
          select: { height: true, blockTimestamp: true },
        });
        if (!earliest) {
          logInfo('all: no attribution yet, skipping window');
          continue;
        }
        lowerHeight = earliest.height;
        windowStart = earliest.blockTimestamp;
      } else {
        const seconds = WINDOW_SECONDS[window];
        lowerHeight = Math.max(0, tipHeight - Math.round(seconds / MONERO_BLOCK_TIME_SECONDS));
        windowStart = new Date(windowEnd.getTime() - seconds * 1000);
      }

      // EXACT canonical-block count in the INCLUSIVE range [lowerHeight, tipHeight]
      // (contiguous heights). +1 so it matches the `gte lowerHeight / lte tipHeight`
      // poolBlocks query below — same interval on both sides (Codex F1).
      const networkBlocks = Math.max(1, tipHeight - lowerHeight + 1);

      // Window-average network hashrate (hourly snapshots, by time). '0' for all.
      let avgHashrate = BigInt(0);
      if (window !== 'all') {
        const snaps = await db.chainHashrateSnapshot.findMany({
          where: { chainId, snapshotAt: { gte: windowStart, lte: windowEnd } },
          select: { hashrate: true },
        });
        if (snaps.length) {
          let sum = BigInt(0);
          for (const s of snaps) {
            try {
              sum += BigInt(s.hashrate || '0');
            } catch {
              /* skip malformed */
            }
          }
          avgHashrate = sum / BigInt(snaps.length);
        }
      }

      const estimate = (blocks: number): string => {
        if (window === 'all' || avgHashrate <= BigInt(0)) return '0';
        return ((avgHashrate * BigInt(blocks)) / BigInt(networkBlocks)).toString();
      };

      const upsertStats = (poolId: number, blocks: number) =>
        db.miningPoolStats.upsert({
          where: { chainId_poolId_windowKind: { chainId, poolId, windowKind: window } },
          update: {
            blocksFound: blocks,
            sharePercent: (blocks / networkBlocks) * 100,
            hashrateEstimate: estimate(blocks),
            windowStart,
            windowEnd,
          },
          create: {
            chainId,
            poolId,
            windowKind: window,
            blocksFound: blocks,
            sharePercent: (blocks / networkBlocks) * 100,
            hashrateEstimate: estimate(blocks),
            windowStart,
            windowEnd,
          },
        });

      // Count + upsert every named pool (incl. 0 — overwrites stale rows).
      let sumPool = 0;
      for (const pool of namedPools) {
        const poolBlocks = await db.moneroBlockAttribution.count({
          where: {
            chainId,
            poolId: pool.id,
            isCanonical: true,
            isConflicted: false,
            height: { gte: lowerHeight, lte: tipHeight },
          },
        });
        sumPool += poolBlocks;
        await upsertStats(pool.id, poolBlocks);
      }

      // Unknown / solo bucket — residual, clamped ≥ 0.
      if (networkBlocks - sumPool < 0) {
        logWarn(`${window}: Σ poolBlocks (${sumPool}) > networkBlocks (${networkBlocks}) — over-attribution; clamped unknown to 0`);
      }
      const unknownBlocks = Math.max(0, networkBlocks - sumPool);
      await upsertStats(unknownId, unknownBlocks);

      logInfo(`monero-pool-stats[${window}]: networkBlocks=${networkBlocks} named=${sumPool} unknown=${unknownBlocks}`);
    }

    logInfo('Monero pool-stats update completed');
  } catch (e: any) {
    logError(`Monero pool-stats update failed: ${e?.message ?? String(e)}`, e);
  }
};

export default updateMoneroPoolStats;
