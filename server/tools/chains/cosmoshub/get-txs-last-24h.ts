import db from '@/db';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import { GetTxsLast24h } from '@/server/tools/chains/chain-indexer';

const getYesterdayUtc = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
};

/**
 * Cosmos indexer has no /tx-effects-last-24h endpoint, and paginating through
 * the full tx list per cron tick is too expensive. Use the daily snapshot
 * table that powers txs30d: read yesterday's totalTxs snapshot (UTC),
 * subtract from current total. Returns null on the first run (no snapshot yet).
 */
const getTxsLast24h: GetTxsLast24h = async (dbChain) => {
  const { data } = await cosmosIndexer.getTxsStats({ cache: 'no-store' });
  if (!data?.total_txs) {
    return null;
  }
  const currentTotal = BigInt(data.total_txs);

  const snapshot = await db.chainTxDailySnapshot.findUnique({
    where: { chainId_snapshotAt: { chainId: dbChain.id, snapshotAt: getYesterdayUtc() } },
  });
  if (!snapshot) {
    return null;
  }

  const delta = currentTotal - snapshot.totalTxs;
  return delta >= BigInt(0) ? Number(delta) : null;
};

export default getTxsLast24h;
