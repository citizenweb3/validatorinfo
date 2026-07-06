import db from '@/db';
import logger from '@/logger';
import { MONERO_INDEXER_PAGE_SIZE } from '@/server/tools/chains/monero/constants';
import {
  listMoneroBlocks,
  MoneroBlock as IndexerMoneroBlock,
} from '@/server/tools/chains/monero/indexer-client';
import {
  UNKNOWN_POOL_NAME,
  UNKNOWN_POOL_SLUG,
} from '@/server/tools/chains/monero/attribution-source';
import {
  fetchPoolBlocks,
  getPoolRegistry,
  sourceForPool,
} from '@/server/tools/chains/monero/pool-client';

const { logInfo, logError, logWarn } = logger('monero-pool-attribution');

const MAX_PAGES = 4; // tip-ward scan cap per confirm/reorg pass
const REORG_RECHECK = 500; // newest attributions re-verified for canonicality each run

interface IndexerBlockInfo {
  height: number;
  timestamp: number; // on-chain unix seconds
  isCanonical: boolean;
}

interface MoneroBlockCreateInput {
  chainId: number;
  height: number;
  blockHash: string;
  blockTimestamp: Date;
  majorVersion: number;
  minorVersion: number;
  size: number;
  weight: number;
  longTermWeight: number;
  txCount: number;
  rewardAtomic: string;
  isCanonical: boolean;
}

const toMoneroBlockCreateInput = (chainId: number, blk: IndexerMoneroBlock): MoneroBlockCreateInput => ({
  chainId,
  height: blk.height,
  blockHash: blk.hash,
  blockTimestamp: new Date(blk.timestamp * 1000),
  majorVersion: blk.majorVersion,
  minorVersion: blk.minorVersion,
  size: blk.size,
  weight: blk.weight,
  longTermWeight: blk.longTermWeight,
  txCount: blk.txCount,
  rewardAtomic: blk.reward,
  isCanonical: blk.isCanonical,
});

// Page the indexer block list (desc) from tip down to `floorHeight`, into a
// hash -> {height, timestamp, isCanonical} map. Bounded by MAX_PAGES. The list
// is canonical-filtered by the indexer (canonical=true default), so an orphaned
// block is ABSENT, not present-with-isCanonical=false — `lowestHeight` lets the
// caller tell "absent because orphaned (within span)" from "absent because below
// the scanned depth". Returns the lowest height actually covered.
const buildCanonicalMap = async (
  chainId: number,
  floorHeight: number,
): Promise<{ map: Map<string, IndexerBlockInfo>; lowestHeight: number }> => {
  const map = new Map<string, IndexerBlockInfo>();
  const moneroBlocks: MoneroBlockCreateInput[] = [];
  let offset = 0;
  let lowestHeight = Number.POSITIVE_INFINITY;
  for (let pages = 0; pages < MAX_PAGES; pages++) {
    const page = await listMoneroBlocks({ limit: MONERO_INDEXER_PAGE_SIZE, offset, order: 'desc' });
    for (const blk of page.items) {
      map.set(blk.hash, { height: blk.height, timestamp: blk.timestamp, isCanonical: blk.isCanonical });
      moneroBlocks.push(toMoneroBlockCreateInput(chainId, blk));
      if (blk.height < lowestHeight) lowestHeight = blk.height;
    }
    const lowest = page.items.length ? page.items[page.items.length - 1].height : 0;
    if (!page.hasMore || lowest <= floorHeight) break;
    offset = page.nextOffset;
  }
  if (moneroBlocks.length) {
    // Telemetry persistence is best-effort and MUST NOT abort pool attribution: a single malformed
    // block (e.g. a missing indexer field -> NaN Int) would otherwise throw out of this shared code
    // path and skip the attribution + reorg writes. Isolate it — log and continue.
    try {
      await db.moneroBlock.createMany({ data: moneroBlocks, skipDuplicates: true });
    } catch (e: any) {
      logError(`monero-block telemetry persist failed (isolated): ${e?.message ?? String(e)}`, e);
    }
  }
  return { map, lowestHeight: lowestHeight === Number.POSITIVE_INFINITY ? 0 : lowestHeight };
};

/**
 * Monero pool-attribution job (design §5.2). Pools list the blocks they found;
 * we confirm each against the indexer's canonical set (by hash) and persist a
 * per-block attribution. Conflicting claims on one hash are flagged (never
 * silently moved). Per-pool failures are isolated. DB writes are batched.
 */
const updateMoneroPoolAttribution = async (): Promise<void> => {
  logInfo('Starting Monero pool-attribution');

  try {
    const dbChain = await db.chain.findFirst({ where: { name: 'monero' } });
    if (!dbChain) {
      logWarn('Chain "monero" not found, skipping');
      return;
    }
    const chainId = dbChain.id;

    await db.miningPool.upsert({
      where: { chainId_slug: { chainId, slug: UNKNOWN_POOL_SLUG } },
      update: { name: UNKNOWN_POOL_NAME },
      create: { chainId, slug: UNKNOWN_POOL_SLUG, name: UNKNOWN_POOL_NAME, identificationMethod: 'unknown', isVerified: false },
    });

    // 1. Poll each pool (isolated) — upsert its MiningPool + collect found blocks.
    const collected: Array<{ poolKey: string; source: string; blocks: Array<{ height: number; hash: string; timestamp: number }> }> = [];
    let minHeight = Number.POSITIVE_INFINITY;

    for (const pool of getPoolRegistry()) {
      try {
        const blocks = await fetchPoolBlocks(pool);
        const poolFields = {
          name: pool.name,
          logoUrl: pool.logoUrl,
          website: pool.website,
          github: pool.github,
          twitter: pool.twitter,
          paymentScheme: pool.paymentScheme,
          feePercent: pool.feePercent,
          identificationMethod: sourceForPool(pool),
          isVerified: true,
        };
        await db.miningPool.upsert({
          where: { chainId_slug: { chainId, slug: pool.key } },
          update: poolFields,
          create: { chainId, slug: pool.key, ...poolFields },
        });
        if (blocks.length) {
          collected.push({ poolKey: pool.key, source: sourceForPool(pool), blocks });
          for (const b of blocks) minHeight = Math.min(minHeight, b.height);
        }
        logInfo(`pool=${pool.key}: ${blocks.length} found blocks`);
      } catch (e: any) {
        logError(`pool=${pool.key} fetch failed (isolated): ${e?.message ?? String(e)}`);
      }
    }
    if (collected.length === 0) {
      logInfo('No pool blocks collected, skipping');
      return;
    }

    // 2. Confirm against canonical indexer set (batched map).
    const { map: confirmMap } = await buildCanonicalMap(chainId, minHeight);

    const pools = await db.miningPool.findMany({ where: { chainId }, select: { id: true, slug: true } });
    const slugToId = new Map(pools.map((p) => [p.slug, p.id]));

    // 3. Fold all claims by hash (detect same-run conflicts: 2+ distinct pools on one hash).
    interface Claim {
      info: IndexerBlockInfo;
      poolIds: Set<number>;
      firstPoolId: number;
      source: string;
      poolReportedAt: Date | null;
    }
    const byHash = new Map<string, Claim>();
    for (const { poolKey, source, blocks } of collected) {
      const poolId = slugToId.get(poolKey);
      if (poolId === undefined) continue;
      for (const b of blocks) {
        const info = confirmMap.get(b.hash);
        if (!info || !info.isCanonical) continue; // not indexed yet / orphan → skip
        const existing = byHash.get(b.hash);
        if (existing) {
          existing.poolIds.add(poolId);
        } else {
          byHash.set(b.hash, {
            info,
            poolIds: new Set([poolId]),
            firstPoolId: poolId,
            source,
            poolReportedAt: b.timestamp ? new Date(b.timestamp * 1000) : null,
          });
        }
      }
    }
    if (byHash.size === 0) {
      logInfo('No canonical pool blocks to attribute');
      return;
    }

    // 4. Batch existence read, then partition into create / conflict / refresh.
    const hashes = Array.from(byHash.keys());
    const existingRows = await db.moneroBlockAttribution.findMany({
      where: { chainId, blockHash: { in: hashes } },
      select: { blockHash: true, poolId: true, isConflicted: true },
    });
    const existingMap = new Map(existingRows.map((r) => [r.blockHash, r]));

    const creates: Array<{
      chainId: number; height: number; blockHash: string; poolId: number; source: string;
      blockTimestamp: Date; poolReportedAt: Date | null; isCanonical: boolean; isConflicted: boolean;
    }> = [];
    const conflictHashes: string[] = [];
    const refreshHashes: string[] = [];

    for (const [hash, claim] of Array.from(byHash.entries())) {
      const existing = existingMap.get(hash);
      const blockTimestamp = new Date(claim.info.timestamp * 1000);
      if (!existing) {
        const sameRunConflict = claim.poolIds.size > 1;
        creates.push({
          chainId,
          height: claim.info.height,
          blockHash: hash,
          poolId: claim.firstPoolId,
          source: claim.source,
          blockTimestamp,
          poolReportedAt: claim.poolReportedAt,
          isCanonical: true,
          isConflicted: sameRunConflict,
        });
      } else if (!existing.isConflicted && Array.from(claim.poolIds).some((id) => id !== existing.poolId)) {
        conflictHashes.push(hash); // a different pool now also claims it → flag
      } else {
        refreshHashes.push(hash); // same pool / already conflicted → keep canonical
      }
    }

    if (creates.length) {
      await db.moneroBlockAttribution.createMany({ data: creates, skipDuplicates: true });
    }
    if (conflictHashes.length) {
      await db.moneroBlockAttribution.updateMany({
        where: { chainId, blockHash: { in: conflictHashes } },
        data: { isConflicted: true },
      });
    }
    if (refreshHashes.length) {
      await db.moneroBlockAttribution.updateMany({
        where: { chainId, blockHash: { in: refreshHashes } },
        data: { isCanonical: true },
      });
    }

    // 5. Bounded reorg re-verify (two-way), depth fixed at REORG_RECHECK rows —
    //    independent of what pools reported. Uses its own canonical map.
    let reorged = 0;
    let blockReorged = 0;
    const recent = await db.moneroBlockAttribution.findMany({
      where: { chainId },
      orderBy: { blockTimestamp: 'desc' },
      take: REORG_RECHECK,
      select: { blockHash: true, height: true, isCanonical: true },
    });
    if (recent.length) {
      const minRecent = recent.reduce((m, r) => Math.min(m, r.height), Number.POSITIVE_INFINITY);
      const { map: reorgMap, lowestHeight: reorgLowest } = await buildCanonicalMap(chainId, minRecent);
      const setFalse: string[] = [];
      const setTrue: string[] = [];
      for (const r of recent) {
        if (reorgMap.has(r.blockHash)) {
          // Present in the canonical list → block is canonical; restore if previously flipped.
          if (!r.isCanonical) setTrue.push(r.blockHash);
        } else if (r.height >= reorgLowest && r.isCanonical) {
          // Absent BUT within the scanned canonical span → the block was orphaned/
          // replaced (the list dropped it) → flip non-canonical. (Below the scan
          // depth we can't tell, so leave as settled.)
          setFalse.push(r.blockHash);
        }
      }
      const recentBlocks =
        reorgLowest > 0
          ? await db.moneroBlock.findMany({
              where: { chainId, height: { gte: reorgLowest } },
              select: { blockHash: true, height: true, isCanonical: true },
            })
          : [];
      const blockSetFalse: string[] = [];
      const blockSetTrue: string[] = [];
      for (const r of recentBlocks) {
        if (reorgMap.has(r.blockHash)) {
          if (!r.isCanonical) blockSetTrue.push(r.blockHash);
        } else if (r.height >= reorgLowest && r.isCanonical) {
          blockSetFalse.push(r.blockHash);
        }
      }
      if (setFalse.length) {
        await db.moneroBlockAttribution.updateMany({ where: { chainId, blockHash: { in: setFalse } }, data: { isCanonical: false } });
      }
      if (setTrue.length) {
        await db.moneroBlockAttribution.updateMany({ where: { chainId, blockHash: { in: setTrue } }, data: { isCanonical: true } });
      }
      if (blockSetFalse.length) {
        await db.moneroBlock.updateMany({ where: { chainId, blockHash: { in: blockSetFalse } }, data: { isCanonical: false } });
      }
      if (blockSetTrue.length) {
        await db.moneroBlock.updateMany({ where: { chainId, blockHash: { in: blockSetTrue } }, data: { isCanonical: true } });
      }
      reorged = setFalse.length + setTrue.length;
      blockReorged = blockSetFalse.length + blockSetTrue.length;
    }

    logInfo(
      `monero-pool-attribution: pools=${collected.length} created=${creates.length} conflicts=${conflictHashes.length} refreshed=${refreshHashes.length} reorged=${reorged} blockReorged=${blockReorged}`,
    );
  } catch (e: any) {
    logError(`Monero pool-attribution failed: ${e?.message ?? String(e)}`, e);
  }
};

export default updateMoneroPoolAttribution;
