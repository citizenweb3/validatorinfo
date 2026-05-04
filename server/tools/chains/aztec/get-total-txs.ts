import aztecIndexer from '@/services/aztec-indexer-api';
import { GetTotalTxs } from '@/server/tools/chains/chain-indexer';

const getTotalTxs: GetTotalTxs = async () => {
  const value = await aztecIndexer.getTotalTxEffects({ cache: 'no-store' });
  return value !== null && value !== undefined ? BigInt(value) : null;
};

export default getTotalTxs;
