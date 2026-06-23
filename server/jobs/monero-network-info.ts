import db from '@/db';
import logger from '@/logger';
import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';
import { getHealth, getLatestSupply, getTipBlock } from '@/server/tools/chains/monero/indexer-client';

const { logInfo, logError, logWarn } = logger('monero-network-info');

// Real Monero tip has been > 1M since 2016; the order=desc string-sort artifact
// (§8.1) returns height 999999. Anything below this floor is an artifact.
const MIN_PLAUSIBLE_HEIGHT = 1_000_000;
// Generous slack for indexer lag behind the node; the artifact is ~2.7M off.
const NODE_HEIGHT_TOLERANCE = 100_000;

/**
 * Monero network-info job (design §6) — single-source on the indexer.
 *
 *  - Hashrate snapshot: tip-block difficulty / 120s (BigInt end-to-end).
 *  - Total supply: latest /api/v1/supply cumulative_emission_atomic — RAW ATOMIC,
 *    EMISSION-ONLY (the app divides by 10^coinDecimals at read; fees are NOT
 *    added — they add no new supply).
 *
 * Sanity guard: never persist a bogus snapshot. Skip if difficulty is null/
 * malformed, or if the tip height is implausible vs the node height from /health
 * (defends against a regressed indexer). No direct monerod RPC.
 */
const updateMoneroNetworkInfo = async (): Promise<void> => {
  logInfo('Starting Monero network-info update');

  try {
    const dbChain = await db.chain.findFirst({ where: { name: 'monero' } });
    if (!dbChain) {
      logWarn('Chain "monero" not found in database, skipping');
      return;
    }

    const tip = await getTipBlock();
    if (!tip) {
      logWarn('No tip block returned by indexer, skipping');
      return;
    }

    // Sanity guards (§6) — never write a bogus 0/NaN snapshot.
    if (tip.difficulty === null) {
      logWarn(`Tip difficulty missing/malformed at height ${tip.height} — skipping snapshot`);
      return;
    }
    // Hard floor — catches the order=desc string-sort artifact (height 999999)
    // even when /health is unavailable.
    if (tip.height < MIN_PLAUSIBLE_HEIGHT) {
      logWarn(`Tip height ${tip.height} below plausibility floor (ordering artifact?) — skipping`);
      return;
    }
    // Two-sided cross-check vs the node height (catches both a stale-low and a
    // runaway-high tip).
    const health = await getHealth();
    if (health?.nodeHeight != null) {
      if (Math.abs(tip.height - health.nodeHeight) > NODE_HEIGHT_TOLERANCE) {
        logWarn(`Tip height ${tip.height} implausible vs node_height ${health.nodeHeight} — skipping`);
        return;
      }
    } else {
      logWarn('No /health node_height — proceeding on the floor guard only');
    }

    const hashrate = (tip.difficulty / BigInt(MONERO_BLOCK_TIME_SECONDS)).toString();
    const difficulty = tip.difficulty.toString();
    const snapshotAt = new Date(Math.floor(Date.now() / 60_000) * 60_000);

    await db.chainHashrateSnapshot.upsert({
      where: { chainId_snapshotAt: { chainId: dbChain.id, snapshotAt } },
      update: { height: tip.height, hashrate, difficulty },
      create: { chainId: dbChain.id, snapshotAt, height: tip.height, hashrate, difficulty },
    });

    logInfo(`monero: tip=${tip.height} difficulty=${difficulty} hashrate=${hashrate} H/s`);

    // Supply — emission-only, raw atomic (design §6). Never add fee, never /1e12.
    // Guarded: skip an artifact checkpoint (low height) or a non-monotonic value
    // (cumulative emission can only grow) so one bad indexer response can't poison
    // money-sensitive supply.
    const supply = await getLatestSupply();
    if (!supply) {
      logWarn('No supply checkpoint returned by indexer — supply not updated');
    } else if (supply.height < MIN_PLAUSIBLE_HEIGHT) {
      logWarn(`Supply checkpoint height ${supply.height} below floor (artifact?) — supply not updated`);
    } else {
      let newEmission: bigint;
      try {
        newEmission = BigInt(supply.cumulativeEmissionAtomic || '0');
      } catch {
        logWarn(`Malformed supply emission "${supply.cumulativeEmissionAtomic}" — supply not updated`);
        newEmission = BigInt(-1);
      }
      if (newEmission >= BigInt(0)) {
        const existing = await db.tokenomics.findUnique({ where: { chainId: dbChain.id }, select: { totalSupply: true } });
        let prev = BigInt(0);
        try {
          prev = BigInt(existing?.totalSupply || '0');
        } catch {
          prev = BigInt(0);
        }
        if (newEmission < prev) {
          logWarn(`Supply would decrease (${newEmission} < ${prev}) — likely a bad checkpoint, supply not updated`);
        } else {
          await db.tokenomics.upsert({
            where: { chainId: dbChain.id },
            update: { totalSupply: supply.cumulativeEmissionAtomic },
            create: { chainId: dbChain.id, totalSupply: supply.cumulativeEmissionAtomic },
          });
          logInfo(`monero: totalSupply (piconero, emission-only)=${supply.cumulativeEmissionAtomic}`);
        }
      }
    }

    logInfo('Monero network-info update completed');
  } catch (e: any) {
    logError(`Monero network-info update failed: ${e?.message ?? String(e)}`, e);
  }
};

export default updateMoneroNetworkInfo;
