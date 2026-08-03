import type { MiningNetworkTrend } from '@/utils/mining-network-trend';
import {
  type MiningReturnEstimate,
  type TrendAdjustedPaybackResult,
  breakEvenDifficulty,
  breakEvenTokenPrice,
  estimateHardwarePaybackDays,
  estimateTrendAdjustedPayback,
} from '@/utils/mining-revenue';

export interface PersonalMiningEconomics {
  breakEvenDifficulty: bigint | null;
  breakEvenTokenPriceUsd: number | null;
  currentPaybackDays: number | null;
  trendPayback: TrendAdjustedPaybackResult | null;
  trendWindowDays: number | null;
}

interface PersonalMiningEconomicsInput {
  electricityCostUsdPerDay: number;
  hardwareCostUsd: number;
  miningReturn: MiningReturnEstimate;
  networkDifficulty: string;
  networkTrend: MiningNetworkTrend | null;
}

export const estimatePersonalMiningEconomics = ({
  electricityCostUsdPerDay,
  hardwareCostUsd,
  miningReturn,
  networkDifficulty,
  networkTrend,
}: PersonalMiningEconomicsInput): PersonalMiningEconomics | null => {
  let currentDifficulty: bigint;
  try {
    currentDifficulty = BigInt(networkDifficulty);
  } catch {
    return null;
  }

  const currentPaybackDays = estimateHardwarePaybackDays(
    hardwareCostUsd,
    miningReturn.netUsdPerDay - electricityCostUsdPerDay,
  );
  const trendPayback = networkTrend
    ? estimateTrendAdjustedPayback({
        difficultyGrowthRatePerDay: networkTrend.difficultyGrowthRatePerDay,
        electricityCostUsdPerDay,
        hardwareCostUsd,
        revenueUsdPerDay: miningReturn.netUsdPerDay,
      })
    : null;

  return {
    breakEvenDifficulty: breakEvenDifficulty(currentDifficulty, miningReturn.netUsdPerDay, electricityCostUsdPerDay),
    breakEvenTokenPriceUsd: breakEvenTokenPrice(miningReturn.netTokenPerDay, electricityCostUsdPerDay),
    currentPaybackDays,
    trendPayback,
    trendWindowDays: networkTrend?.windowDays ?? null,
  };
};
