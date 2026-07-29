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

const SECONDS_PER_DAY = 86_400;

const isFinitePositive = (value: number): boolean => Number.isFinite(value) && value > 0;

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
