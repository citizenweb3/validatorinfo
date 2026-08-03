export interface MiningReturnInput {
  averageReward: number;
  blockTimeSeconds: number;
  minerHashrateHps: number;
  networkHashrateHps: number;
  poolFeePercent: number;
  tokenPriceUsd: number;
  uptimeRatio?: number;
}

export interface MiningReturnEstimate {
  grossTokenPerDay: number;
  grossUsdPerDay: number;
  netTokenPerDay: number;
  netUsdPerDay: number;
  poolFeeTokenPerDay: number;
  poolFeeUsdPerDay: number;
}

export interface PoolFeeWeight {
  feePercent: number | null;
  hashrateHps: number;
}

export interface TrendAdjustedPaybackInput {
  difficultyGrowthRatePerDay: number;
  electricityCostUsdPerDay: number;
  hardwareCostUsd: number;
  horizonDays?: number;
  revenueUsdPerDay: number;
}

export type TrendAdjustedPaybackResult = { days: number; status: 'paid-back' } | { status: 'never' };

const SECONDS_PER_DAY = 86_400;
const DEFAULT_PAYBACK_HORIZON_DAYS = 10 * 365;
const DECIMAL_SCALE = 1_000_000_000;
const BIGINT_RATIO_SCALE = BigInt(1_000_000_000_000);

const isFinitePositive = (value: number): boolean => Number.isFinite(value) && value > 0;

const ratioAsNumber = (firstValue: number | bigint, lastValue: number | bigint): number | null => {
  if (typeof firstValue === 'bigint' && typeof lastValue === 'bigint') {
    if (firstValue <= BigInt(0) || lastValue <= BigInt(0)) return null;

    const scaledRatio = (lastValue * BIGINT_RATIO_SCALE) / firstValue;
    const ratio = Number(scaledRatio) / Number(BIGINT_RATIO_SCALE);
    return isFinitePositive(ratio) ? ratio : null;
  }

  if (typeof firstValue !== 'number' || typeof lastValue !== 'number') return null;
  if (!isFinitePositive(firstValue) || !isFinitePositive(lastValue)) return null;

  const ratio = lastValue / firstValue;
  return isFinitePositive(ratio) ? ratio : null;
};

const toPositiveScaledBigInt = (value: number): bigint | null => {
  if (!isFinitePositive(value)) return null;

  const scaledValue = Math.round(value * DECIMAL_SCALE);
  return Number.isSafeInteger(scaledValue) && scaledValue > 0 ? BigInt(scaledValue) : null;
};

export const weightedAverageFeePercent = (pools: PoolFeeWeight[]): number | null => {
  let weightedFeeTotal = 0;
  let hashrateTotal = 0;

  for (const pool of pools) {
    if (!isFinitePositive(pool.hashrateHps)) continue;
    if (pool.feePercent === null || !Number.isFinite(pool.feePercent) || pool.feePercent < 0) continue;

    weightedFeeTotal += pool.hashrateHps * Math.min(pool.feePercent, 100);
    hashrateTotal += pool.hashrateHps;
  }

  return hashrateTotal > 0 ? weightedFeeTotal / hashrateTotal : null;
};

export const estimateMiningReturn = ({
  averageReward,
  blockTimeSeconds,
  minerHashrateHps,
  networkHashrateHps,
  poolFeePercent,
  tokenPriceUsd,
  uptimeRatio = 1,
}: MiningReturnInput): MiningReturnEstimate | null => {
  if (
    !isFinitePositive(averageReward) ||
    !isFinitePositive(blockTimeSeconds) ||
    !isFinitePositive(minerHashrateHps) ||
    !isFinitePositive(networkHashrateHps) ||
    !isFinitePositive(tokenPriceUsd) ||
    !Number.isFinite(poolFeePercent) ||
    poolFeePercent < 0 ||
    poolFeePercent > 100 ||
    !Number.isFinite(uptimeRatio) ||
    uptimeRatio <= 0 ||
    uptimeRatio > 1
  ) {
    return null;
  }

  const expectedBlocksPerDay =
    (minerHashrateHps / networkHashrateHps) * (SECONDS_PER_DAY / blockTimeSeconds) * uptimeRatio;
  const grossTokenPerDay = expectedBlocksPerDay * averageReward;
  const poolFeeTokenPerDay = grossTokenPerDay * (poolFeePercent / 100);
  const netTokenPerDay = grossTokenPerDay - poolFeeTokenPerDay;
  const grossUsdPerDay = grossTokenPerDay * tokenPriceUsd;
  const poolFeeUsdPerDay = poolFeeTokenPerDay * tokenPriceUsd;

  return {
    grossTokenPerDay,
    grossUsdPerDay,
    netTokenPerDay,
    netUsdPerDay: netTokenPerDay * tokenPriceUsd,
    poolFeeTokenPerDay,
    poolFeeUsdPerDay,
  };
};

export const estimateElectricityCostPerDay = (
  powerWatts: number,
  electricityPriceUsdPerKwh: number,
  uptimeRatio = 1,
): number | null => {
  if (
    !isFinitePositive(powerWatts) ||
    !Number.isFinite(electricityPriceUsdPerKwh) ||
    electricityPriceUsdPerKwh < 0 ||
    !Number.isFinite(uptimeRatio) ||
    uptimeRatio <= 0 ||
    uptimeRatio > 1
  ) {
    return null;
  }

  return (powerWatts / 1_000) * 24 * electricityPriceUsdPerKwh * uptimeRatio;
};

export const estimateHardwarePaybackDays = (hardwareCostUsd: number, netProfitUsdPerDay: number): number | null => {
  if (!isFinitePositive(hardwareCostUsd) || !isFinitePositive(netProfitUsdPerDay)) return null;
  return hardwareCostUsd / netProfitUsdPerDay;
};

export const growthRatePerDay = (
  firstValue: number | bigint,
  lastValue: number | bigint,
  elapsedDays: number,
): number | null => {
  if (!isFinitePositive(elapsedDays)) return null;

  const ratio = ratioAsNumber(firstValue, lastValue);
  if (ratio === null) return null;

  const growthRate = Math.expm1(Math.log(ratio) / elapsedDays);
  return Number.isFinite(growthRate) && growthRate > -1 ? growthRate : null;
};

export const estimateTrendAdjustedPayback = ({
  difficultyGrowthRatePerDay,
  electricityCostUsdPerDay,
  hardwareCostUsd,
  horizonDays = DEFAULT_PAYBACK_HORIZON_DAYS,
  revenueUsdPerDay,
}: TrendAdjustedPaybackInput): TrendAdjustedPaybackResult | null => {
  if (
    !isFinitePositive(hardwareCostUsd) ||
    !isFinitePositive(revenueUsdPerDay) ||
    !Number.isFinite(electricityCostUsdPerDay) ||
    electricityCostUsdPerDay < 0 ||
    !Number.isFinite(difficultyGrowthRatePerDay) ||
    difficultyGrowthRatePerDay <= -1 ||
    !Number.isSafeInteger(horizonDays) ||
    horizonDays <= 0
  ) {
    return null;
  }

  let cumulativeProfitUsd = 0;
  const dailyDifficultyMultiplier = 1 + difficultyGrowthRatePerDay;

  for (let day = 1; day <= horizonDays; day += 1) {
    const difficultyMultiplier = dailyDifficultyMultiplier ** (day - 1);
    const projectedRevenueUsd =
      difficultyMultiplier === 0 ? Number.POSITIVE_INFINITY : revenueUsdPerDay / difficultyMultiplier;
    cumulativeProfitUsd += projectedRevenueUsd - electricityCostUsdPerDay;

    if (cumulativeProfitUsd >= hardwareCostUsd) return { days: day, status: 'paid-back' };
  }

  return { status: 'never' };
};

export const breakEvenTokenPrice = (netTokenPerDay: number, electricityCostUsdPerDay: number): number | null => {
  if (!isFinitePositive(netTokenPerDay)) return null;
  if (!Number.isFinite(electricityCostUsdPerDay) || electricityCostUsdPerDay < 0) return null;

  return electricityCostUsdPerDay / netTokenPerDay;
};

export const breakEvenDifficulty = (
  currentDifficulty: bigint,
  revenueUsdPerDay: number,
  electricityCostUsdPerDay: number,
): bigint | null => {
  if (currentDifficulty <= BigInt(0)) return null;

  const scaledRevenue = toPositiveScaledBigInt(revenueUsdPerDay);
  const scaledElectricityCost = toPositiveScaledBigInt(electricityCostUsdPerDay);
  if (scaledRevenue === null || scaledElectricityCost === null) return null;

  const difficulty = (currentDifficulty * scaledRevenue) / scaledElectricityCost;
  return difficulty > BigInt(0) ? difficulty : null;
};
