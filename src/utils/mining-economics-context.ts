import { weightedAverageFeePercent } from '@/utils/mining-revenue';
import {
  TAIL_EMISSION_ATOMIC,
  annualIssuanceAtomic,
  atomicToDecimal,
  estimateBaseRewardAtomic,
  inflationRate,
  parseAtomicAmount,
} from '@/utils/monero-emission';
import { avgFeeAtomic, rewardComposition } from '@/utils/monero-tx-metrics';

const ZERO = BigInt(0);
const MAX_POOL_FEE_PERCENT = 100;
const TOP_POOL_LIMIT = 5;

export interface MiningPoolFeeOption {
  feePercent: number;
  name: string;
  slug: string;
}

export interface MiningTopPool {
  feePercent: number | null;
  hashrateHps: string;
  name: string;
  sharePercent: number;
  slug: string;
}

export interface MiningNetworkFees {
  averageFeeAtomic: string | null;
  feeShare: number | null;
  transactionsPerDay: number | null;
}

export interface MiningEmissionContext {
  annualIssuanceAtomic: string;
  blockRewardAtomic: string;
  inflationRate: number | null;
  tailEmissionAtomic: string;
  tailEmissionReached: boolean;
  tailHeadroomAtomic: string;
}

export interface MiningPoolContext {
  poolFees: MiningPoolFeeOption[];
  topPools: MiningTopPool[];
  weightedPoolFeePercent: number | null;
}

export interface MiningCoreSnapshot extends MiningPoolContext {
  averageReward: number;
  networkDifficulty: string | null;
  networkHashrateHps: number;
  tokenPriceUsd: number;
  tokenSymbol: string;
}

interface MiningPoolStatsInput {
  hashrateEstimate: string;
  pool: {
    feePercent: number | null;
    isVerified: boolean;
    name: string;
    slug: string;
  };
  sharePercent: number;
}

interface MiningTxMetricsInput {
  feeBlockCount: number;
  feeTxCount: number;
  sumRewardAtomic: string;
  totalTx: number;
}

interface MiningCoreSnapshotInput {
  averageRewardAtomic: string | null;
  coinDecimals: number;
  networkSnapshot: { difficulty: string; hashrate: string } | null;
  poolStats: readonly MiningPoolStatsInput[] | null;
  tokenPriceUsd: number;
  tokenSymbol: string;
}

const isValidPoolFee = (feePercent: number | null): feePercent is number =>
  feePercent !== null && Number.isFinite(feePercent) && feePercent >= 0 && feePercent <= MAX_POOL_FEE_PERCENT;

const parseHashrate = (hashrateEstimate: string): bigint | null => {
  try {
    const hashrate = BigInt(hashrateEstimate);
    return hashrate >= ZERO ? hashrate : null;
  } catch {
    return null;
  }
};

export const buildMiningPoolContext = (poolStats: readonly MiningPoolStatsInput[] | null): MiningPoolContext => {
  const knownPools = (poolStats ?? []).filter((stat) => stat.pool.isVerified && stat.pool.slug !== 'unknown');
  const poolFees = knownPools
    .flatMap((stat): MiningPoolFeeOption[] => {
      const feePercent = stat.pool.feePercent;
      if (!isValidPoolFee(feePercent)) return [];

      return [{ feePercent, name: stat.pool.name, slug: stat.pool.slug }];
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug));

  const weightedPoolFeePercent = weightedAverageFeePercent(
    knownPools.map((stat) => {
      const hashrate = parseHashrate(stat.hashrateEstimate);
      const hashrateHps = hashrate === null ? Number.NaN : Number(hashrate);
      const feePercent = isValidPoolFee(stat.pool.feePercent) ? stat.pool.feePercent : null;
      return { feePercent, hashrateHps };
    }),
  );

  const topPools = knownPools
    .flatMap((stat): MiningTopPool[] => {
      const hashrate = parseHashrate(stat.hashrateEstimate);
      if (hashrate === null || !Number.isFinite(stat.sharePercent) || stat.sharePercent < 0) return [];

      return [
        {
          feePercent: isValidPoolFee(stat.pool.feePercent) ? stat.pool.feePercent : null,
          hashrateHps: hashrate.toString(),
          name: stat.pool.name,
          sharePercent: stat.sharePercent,
          slug: stat.pool.slug,
        },
      ];
    })
    .sort((a, b) => b.sharePercent - a.sharePercent || a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug))
    .slice(0, TOP_POOL_LIMIT);

  return { poolFees, topPools, weightedPoolFeePercent };
};

export const buildMiningNetworkFees = (
  metrics: MiningTxMetricsInput | null,
  supplyRaw: string | null,
): MiningNetworkFees | null => {
  if (metrics === null) return null;

  const transactionsPerDay = Number.isSafeInteger(metrics.totalTx) && metrics.totalTx >= 0 ? metrics.totalTx : null;
  const sumRewardAtomic = parseAtomicAmount(metrics.sumRewardAtomic);
  const supplyAtomic = parseAtomicAmount(supplyRaw);
  const subsidyAtomic = supplyAtomic === null ? TAIL_EMISSION_ATOMIC : estimateBaseRewardAtomic(supplyAtomic);
  const hasValidFeeCounts =
    Number.isSafeInteger(metrics.feeBlockCount) &&
    metrics.feeBlockCount > 0 &&
    Number.isSafeInteger(metrics.feeTxCount) &&
    metrics.feeTxCount > 0;

  if (sumRewardAtomic === null || !hasValidFeeCounts) {
    return { averageFeeAtomic: null, feeShare: null, transactionsPerDay };
  }

  const averageFee = avgFeeAtomic(sumRewardAtomic, subsidyAtomic, metrics.feeBlockCount, metrics.feeTxCount);
  const composition = rewardComposition(sumRewardAtomic, subsidyAtomic, metrics.feeBlockCount);

  return {
    averageFeeAtomic: averageFee?.toString() ?? null,
    feeShare: composition?.feeShare ?? null,
    transactionsPerDay,
  };
};

export const buildMiningEmissionContext = (supplyRaw: string | null): MiningEmissionContext | null => {
  const supplyAtomic = parseAtomicAmount(supplyRaw);
  if (supplyAtomic === null) return null;

  const blockRewardAtomic = estimateBaseRewardAtomic(supplyAtomic);
  const annualAtomic = annualIssuanceAtomic(blockRewardAtomic);
  const tailHeadroomAtomic = blockRewardAtomic > TAIL_EMISSION_ATOMIC ? blockRewardAtomic - TAIL_EMISSION_ATOMIC : ZERO;

  return {
    annualIssuanceAtomic: annualAtomic.toString(),
    blockRewardAtomic: blockRewardAtomic.toString(),
    inflationRate: inflationRate(annualAtomic, supplyAtomic),
    tailEmissionAtomic: TAIL_EMISSION_ATOMIC.toString(),
    tailEmissionReached: blockRewardAtomic === TAIL_EMISSION_ATOMIC,
    tailHeadroomAtomic: tailHeadroomAtomic.toString(),
  };
};

export const buildMiningCoreSnapshot = ({
  averageRewardAtomic,
  coinDecimals,
  networkSnapshot,
  poolStats,
  tokenPriceUsd,
  tokenSymbol,
}: MiningCoreSnapshotInput): MiningCoreSnapshot | null => {
  if (
    !networkSnapshot ||
    !Number.isFinite(tokenPriceUsd) ||
    tokenPriceUsd <= 0 ||
    !Number.isSafeInteger(coinDecimals) ||
    coinDecimals < 0
  ) {
    return null;
  }

  const networkHashrateHps = Number(networkSnapshot.hashrate);
  const rewardAtomic = parseAtomicAmount(averageRewardAtomic);
  if (!Number.isFinite(networkHashrateHps) || networkHashrateHps <= 0 || rewardAtomic === null) return null;

  const averageReward = atomicToDecimal(rewardAtomic, coinDecimals);
  if (!Number.isFinite(averageReward) || averageReward <= 0) return null;

  let networkDifficulty: string | null = null;
  try {
    const parsedDifficulty = BigInt(networkSnapshot.difficulty);
    if (parsedDifficulty > ZERO) networkDifficulty = parsedDifficulty.toString();
  } catch {
    networkDifficulty = null;
  }

  return {
    averageReward,
    networkDifficulty,
    networkHashrateHps,
    tokenPriceUsd,
    tokenSymbol,
    ...buildMiningPoolContext(poolStats),
  };
};
