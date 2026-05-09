import cosmosIndexer from '@/services/cosmos-indexer-api';
import { GetTotalTxs } from '@/server/tools/chains/chain-indexer';

const getTotalTxs: GetTotalTxs = async () => {
  const { data } = await cosmosIndexer.getTxsStats({ cache: 'no-store' });
  if (!data?.total_txs) {
    return null;
  }
  return BigInt(data.total_txs);
};

export default getTotalTxs;
