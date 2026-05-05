import { GetTps } from '@/server/tools/chains/chain-indexer';
import getTxsLast24h from '@/server/tools/chains/logos-testnet/get-txs-last-24h';

// Logos testnet has no per-block tps stream — derive from txsLast24h.
const getTps: GetTps = async (dbChain) => {
  const txsLast24h = await getTxsLast24h(dbChain);
  return txsLast24h !== null ? txsLast24h / 86400 : null;
};

export default getTps;
