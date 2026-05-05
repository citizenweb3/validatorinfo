import aztecIndexer from '@/services/aztec-indexer-api';
import { GetTxsLast24h } from '@/server/tools/chains/chain-indexer';

const getTxsLast24h: GetTxsLast24h = async () => {
  const value = await aztecIndexer.getTxEffectsLast24h({ cache: 'no-store' });
  return value ?? null;
};

export default getTxsLast24h;
