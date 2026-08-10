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
  // Distinguishes "no difficulty threshold exists" from "difficulty data is missing":
  // both leave breakEvenDifficulty null but mean different things to the reader.
  difficultyAvailable: boolean;
  breakEvenTokenPriceUsd: number | null;
  currentPaybackDays: number | null;
  trendPayback: TrendAdjustedPaybackResult | null;
  trendWindowDays: number | null;
}

interface PersonalMiningEconomicsInput {
  electricityCostUsdPerDay: number;
  hardwareCostUsd: number;
  miningReturn: MiningReturnEstimate;
  networkDifficulty: string | null;
  networkTrend: MiningNetworkTrend | null;
}

const parseDifficulty = (value: string | null): bigint | null => {
  if (value === null) return null;
  try {
    const parsed = BigInt(value);
    return parsed > BigInt(0) ? parsed : null;
  } catch {
    return null;
  }
};

export const estimatePersonalMiningEconomics = ({
  electricityCostUsdPerDay,
  hardwareCostUsd,
  miningReturn,
  networkDifficulty,
  networkTrend,
}: PersonalMiningEconomicsInput): PersonalMiningEconomics => {
  const currentDifficulty = parseDifficulty(networkDifficulty);
  const difficultyGrowthRatePerDay = networkTrend?.difficultyGrowthRatePerDay ?? null;

  const currentPaybackDays = estimateHardwarePaybackDays(
    hardwareCostUsd,
    miningReturn.netUsdPerDay - electricityCostUsdPerDay,
  );
  // The projection needs the difficulty growth rate only; an unavailable price or block
  // time in the same trend block must not withhold it.
  const trendPayback =
    difficultyGrowthRatePerDay !== null
      ? estimateTrendAdjustedPayback({
          difficultyGrowthRatePerDay,
          electricityCostUsdPerDay,
          hardwareCostUsd,
          revenueUsdPerDay: miningReturn.netUsdPerDay,
        })
      : null;

  return {
    breakEvenDifficulty:
      currentDifficulty === null
        ? null
        : breakEvenDifficulty(currentDifficulty, miningReturn.netUsdPerDay, electricityCostUsdPerDay),
    difficultyAvailable: currentDifficulty !== null,
    breakEvenTokenPriceUsd: breakEvenTokenPrice(miningReturn.netTokenPerDay, electricityCostUsdPerDay),
    currentPaybackDays,
    trendPayback,
    trendWindowDays: difficultyGrowthRatePerDay !== null ? networkTrend?.windowDays ?? null : null,
  };
};
