import atomoneIndexer from '@/services/atomone-indexer-api';
import { GetAvgFee } from '@/server/tools/chains/chain-indexer';

const AVG_FEE_TX_WINDOW = 100;
const NATIVE_FEE_DENOM = 'uphoton';

const getAvgFee: GetAvgFee = async () => {
  const { data } = await atomoneIndexer.getTxsList(
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
