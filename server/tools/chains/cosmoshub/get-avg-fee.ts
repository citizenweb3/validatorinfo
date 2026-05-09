import cosmosIndexer from '@/services/cosmos-indexer-api';
import { GetAvgFee } from '@/server/tools/chains/chain-indexer';

const AVG_FEE_TX_WINDOW = 100;
const NATIVE_FEE_DENOM = 'uatom';

/**
 * Local avgFee aggregation over the most recent successful txs paying in uatom.
 * Failed txs (code !== 0) and txs paying in alternative denoms are excluded.
 */
const getAvgFee: GetAvgFee = async () => {
  const { data } = await cosmosIndexer.getTxsList(
    { limit: AVG_FEE_TX_WINDOW },
    { cache: 'no-store' },
  );
  if (!data || data.length === 0) {
    return null;
  }

  const fees = data
    .filter((tx) => tx.code === 0 && tx.fee?.amount && tx.fee.denom === NATIVE_FEE_DENOM)
    .map((tx) => BigInt(tx.fee!.amount as string));

  if (fees.length === 0) {
    return null;
  }

  const sum = fees.reduce((acc, value) => acc + value, BigInt(0));
  const avg = sum / BigInt(fees.length);
  return avg.toString();
};

export default getAvgFee;
