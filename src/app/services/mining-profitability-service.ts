import 'server-only';

import logger from '@/logger';
import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import moneroService from '@/services/monero-service';
import priceHistoryService from '@/services/price-history-service';
import { MiningNetworkTrend, buildMiningNetworkTrend, selectMiningTrendWindow } from '@/utils/mining-network-trend';
import { weightedAverageFeePercent } from '@/utils/mining-revenue';
import { atomicToDecimal } from '@/utils/monero-emission';

const { logError } = logger('mining-profitability-service');

export interface MiningPoolFeeOption {
  feePercent: number;
  name: string;
  slug: string;
}

export interface MoneroMiningEconomics {
  averageReward: number;
  blockTimeSeconds: number;
  networkDifficulty: string | null;
  networkHashrateHps: number;
  networkTrend: MiningNetworkTrend | null;
  poolFees: MiningPoolFeeOption[];
  tokenPriceUsd: number;
  tokenSymbol: string;
  weightedPoolFeePercent: number;
}

const getMoneroNetworkTrend = async (chainId: number, referenceAt: Date): Promise<MiningNetworkTrend | null> => {
  const [historyStart, snapshots, priceHistory] = await Promise.all([
    moneroService.getMoneroHashrateHistoryStart(),
    moneroService.getMoneroHashrateHistory('30d'),
    priceHistoryService.getChartData(chainId),
  ]);

  const windowDays = selectMiningTrendWindow(historyStart, referenceAt);
  if (windowDays === null) return null;

  return buildMiningNetworkTrend({ priceHistory, referenceAt, snapshots, windowDays });
};

const getMoneroMiningEconomics = async (
  chain: ChainWithParamsAndTokenomics | null,
): Promise<MoneroMiningEconomics | null> => {
  if (!chain || chain.name !== 'monero' || chain.consensusType !== 'pow' || chain.params?.coinDecimals == null) {
    return null;
  }

  const referenceAt = new Date();
  const networkTrendPromise = getMoneroNetworkTrend(chain.id, referenceAt).catch((error: unknown) => {
    logError('Unable to build Monero mining network trend; returning current economics without it', error);
    return null;
  });
  const [price, snapshot, blockMetrics, poolStats, networkTrend] = await Promise.all([
    chainService.getTokenPriceByChainId(chain.id),
    moneroService.getMoneroNetworkSnapshot(),
    moneroService.getMoneroBlockMetrics24h(),
    moneroService.getMoneroPoolStats('24h'),
    networkTrendPromise,
  ]);

  if (!price || price.value <= 0 || !snapshot || !blockMetrics?.averageRewardAtomic) return null;

  const networkHashrateHps = Number(snapshot.hashrate);
  if (!Number.isFinite(networkHashrateHps) || networkHashrateHps <= 0) return null;

  // Difficulty only backs the break-even-difficulty row, so a malformed value drops that
  // row rather than the whole calculator.
  let networkDifficulty: string | null = null;
  try {
    const parsedDifficulty = BigInt(snapshot.difficulty);
    if (parsedDifficulty > BigInt(0)) networkDifficulty = parsedDifficulty.toString();
  } catch {
    networkDifficulty = null;
  }

  let averageReward: number;
  try {
    averageReward = atomicToDecimal(BigInt(blockMetrics.averageRewardAtomic), chain.params.coinDecimals);
  } catch {
    return null;
  }

  if (!Number.isFinite(averageReward) || averageReward <= 0) return null;

  const knownPools = poolStats.filter((stat) => stat.pool.isVerified && stat.pool.slug !== 'unknown');
  const weightedPoolFee = weightedAverageFeePercent(
    knownPools.map((stat) => ({
      feePercent: stat.pool.feePercent,
      hashrateHps: Number(stat.hashrateEstimate),
    })),
  );
  if (weightedPoolFee === null) return null;

  const poolFees = knownPools
    .filter((stat) => stat.pool.feePercent !== null)
    .map((stat) => ({
      feePercent: stat.pool.feePercent as number,
      name: stat.pool.name,
      slug: stat.pool.slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug));

  return {
    averageReward,
    blockTimeSeconds: MONERO_BLOCK_TIME_SECONDS,
    networkDifficulty,
    networkHashrateHps,
    networkTrend,
    poolFees,
    tokenPriceUsd: price.value,
    tokenSymbol: chain.params.denom ?? 'XMR',
    weightedPoolFeePercent: weightedPoolFee,
  };
};

const miningProfitabilityService = {
  getMoneroMiningEconomics,
};

export default miningProfitabilityService;
export { getMoneroMiningEconomics };
