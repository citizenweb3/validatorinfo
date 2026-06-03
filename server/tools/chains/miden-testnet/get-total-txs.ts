import midenIndexer from '@/services/miden-indexer-api';
import { GetTotalTxs } from '@/server/tools/chains/chain-indexer';

const getTotalTxs: GetTotalTxs = async () => {
  const stats = await midenIndexer.getStats({ cache: 'no-store' });
  const total = stats?.total_transactions;
  if (typeof total !== 'number' || !Number.isInteger(total) || total < 0) return null;
  return BigInt(total);
};

export default getTotalTxs;
