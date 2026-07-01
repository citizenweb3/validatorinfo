import midenIndexer from '@/services/miden-indexer-api';
import { GetTps } from '@/server/tools/chains/chain-indexer';
import getTxsLast24h from '@/server/tools/chains/miden-testnet/get-txs-last-24h';

// Miden indexer exposes `tps` directly in /stats. Use it as the primary source
// and fall back to derivation from the 24h delta if the field is missing
// (older indexer responses) or non-finite.
const getTps: GetTps = async (dbChain) => {
  const stats = await midenIndexer.getStats({ cache: 'no-store' });
  if (typeof stats?.tps === 'number' && Number.isFinite(stats.tps) && stats.tps >= 0) {
    return stats.tps;
  }
  const txsLast24h = await getTxsLast24h(dbChain);
  return txsLast24h !== null ? txsLast24h / 86400 : null;
};

export default getTps;
