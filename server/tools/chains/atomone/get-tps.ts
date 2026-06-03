import atomoneIndexer from '@/services/atomone-indexer-api';
import { GetTps } from '@/server/tools/chains/chain-indexer';

const TPS_BLOCK_WINDOW = 100;

const getTps: GetTps = async () => {
  const { data } = await atomoneIndexer.getBlocksList(
    { limit: TPS_BLOCK_WINDOW },
    { cache: 'no-store' },
  );
  if (!data || data.length < 2) {
    return null;
  }

  const sorted = [...data].sort((a, b) => Number(BigInt(a.height) - BigInt(b.height)));
  const totalTxs = sorted.reduce((sum, block) => sum + block.tx_count, 0);
  const firstTime = new Date(sorted[0].time).getTime();
  const lastTime = new Date(sorted[sorted.length - 1].time).getTime();
  const elapsedSec = Math.max((lastTime - firstTime) / 1000, 1);

  return totalTxs / elapsedSec;
};

export default getTps;
