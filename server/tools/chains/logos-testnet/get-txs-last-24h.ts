import db from '@/db';
import logosIndexer from '@/services/logos-indexer-api';
import { GetTxsLast24h } from '@/server/tools/chains/chain-indexer';

const getYesterdayUtc = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
};

/**
 * Logos has no /tx-effects-last-24h endpoint, and paginating through the full
 * tx list per cron tick is far too expensive. Use the daily snapshot table
 * that powers txs30d: read yesterday's totalTxs snapshot (UTC), subtract from
 * current total. Returns null on the first run (no snapshot yet).
 */
const getTxsLast24h: GetTxsLast24h = async (dbChain) => {
  const stats = await logosIndexer.getStats({ cache: 'no-store' });
  const currentTotal =
    typeof stats?.total_transactions === 'number' ? stats.total_transactions : null;
  if (currentTotal === null) {
    return null;
  }

  const snapshot = await db.chainTxDailySnapshot.findUnique({
    where: { chainId_snapshotAt: { chainId: dbChain.id, snapshotAt: getYesterdayUtc() } },
  });
  if (!snapshot) {
    return null;
  }

  const delta = BigInt(currentTotal) - snapshot.totalTxs;
  return delta >= BigInt(0) ? Number(delta) : null;
};

export default getTxsLast24h;
