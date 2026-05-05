import logosIndexer from '@/services/logos-indexer-api';
import { GetTotalTxs } from '@/server/tools/chains/chain-indexer';

const getTotalTxs: GetTotalTxs = async () => {
  const stats = await logosIndexer.getStats({ cache: 'no-store' });
  return typeof stats?.total_transactions === 'number' ? BigInt(stats.total_transactions) : null;
};

export default getTotalTxs;
