import { growthRatePerDay } from '@/utils/mining-revenue';
import { blockTimeStats } from '@/utils/pow-decentralization';

export type MiningTrendWindowDays = 7 | 30;

export interface MiningTrendSnapshot {
  difficulty: string;
  hashrate: string;
  height: number;
  snapshotAt: Date;
}

export interface MiningTrendPricePoint {
  date: string;
  value: number;
}

export interface MiningNetworkTrend {
  blocksPerHour: number | null;
  difficultyChange: number | null;
  difficultyGrowthRatePerDay: number | null;
  hashrateChange: number | null;
  priceChange: number | null;
  windowDays: MiningTrendWindowDays;
}

interface BuildMiningNetworkTrendInput {
  priceHistory: MiningTrendPricePoint[];
  referenceAt: Date;
  snapshots: MiningTrendSnapshot[];
  windowDays: MiningTrendWindowDays;
}

const DAY_MS = 24 * 60 * 60 * 1_000;
const MAX_SNAPSHOT_ENDPOINT_GAP_MS = 2 * 60 * 60 * 1_000;

const parsePositiveBigInt = (value: string): bigint | null => {
  try {
    const parsedValue = BigInt(value);
    return parsedValue > BigInt(0) ? parsedValue : null;
  } catch {
    return null;
  }
};

const toDateKey = (timestamp: number): string => new Date(timestamp).toISOString().slice(0, 10);

export const selectMiningTrendWindow = (historyStart: Date | null, referenceAt: Date): MiningTrendWindowDays | null => {
  if (!historyStart) return null;

  const historyStartMs = historyStart.getTime();
  const referenceMs = referenceAt.getTime();
  if (!Number.isFinite(historyStartMs) || !Number.isFinite(referenceMs) || historyStartMs >= referenceMs) return null;

  const coverageMs = referenceMs - historyStartMs;
  if (coverageMs >= 30 * DAY_MS) return 30;
  if (coverageMs >= 7 * DAY_MS) return 7;
  return null;
};

interface SnapshotDerivedTrend {
  blocksPerHour: number | null;
  difficultyChange: number | null;
  difficultyGrowthRatePerDay: number | null;
  hashrateChange: number | null;
}

const EMPTY_SNAPSHOT_TREND: SnapshotDerivedTrend = {
  blocksPerHour: null,
  difficultyChange: null,
  difficultyGrowthRatePerDay: null,
  hashrateChange: null,
};

// Each metric is derived independently: a gap in one series must not blank the others,
// and the difficulty growth rate in particular feeds the trend-adjusted payback.
const buildSnapshotTrend = (
  snapshots: MiningTrendSnapshot[],
  cutoffMs: number,
  referenceMs: number,
): SnapshotDerivedTrend => {
  const windowSnapshots = snapshots
    .filter((snapshot) => {
      const snapshotMs = snapshot.snapshotAt.getTime();
      return Number.isFinite(snapshotMs) && snapshotMs >= cutoffMs && snapshotMs <= referenceMs;
    })
    .toSorted((first, second) => first.snapshotAt.getTime() - second.snapshotAt.getTime());

  if (windowSnapshots.length < 2) return EMPTY_SNAPSHOT_TREND;

  const firstSnapshot = windowSnapshots[0];
  const lastSnapshot = windowSnapshots[windowSnapshots.length - 1];
  const firstSnapshotMs = firstSnapshot.snapshotAt.getTime();
  const lastSnapshotMs = lastSnapshot.snapshotAt.getTime();
  if (
    firstSnapshotMs - cutoffMs > MAX_SNAPSHOT_ENDPOINT_GAP_MS ||
    referenceMs - lastSnapshotMs > MAX_SNAPSHOT_ENDPOINT_GAP_MS
  ) {
    return EMPTY_SNAPSHOT_TREND;
  }

  const elapsedDays = (lastSnapshotMs - firstSnapshotMs) / DAY_MS;
  const firstDifficulty = parsePositiveBigInt(firstSnapshot.difficulty);
  const lastDifficulty = parsePositiveBigInt(lastSnapshot.difficulty);
  const firstHashrate = parsePositiveBigInt(firstSnapshot.hashrate);
  const lastHashrate = parsePositiveBigInt(lastSnapshot.hashrate);

  const hasDifficulty = firstDifficulty !== null && lastDifficulty !== null;
  const hasHashrate = firstHashrate !== null && lastHashrate !== null;
  const averageBlockSeconds = blockTimeStats(windowSnapshots).averageSeconds;
  const blocksPerHour = averageBlockSeconds !== null && averageBlockSeconds > 0 ? 3_600 / averageBlockSeconds : null;

  return {
    blocksPerHour: blocksPerHour !== null && Number.isFinite(blocksPerHour) && blocksPerHour > 0 ? blocksPerHour : null,
    difficultyChange: hasDifficulty ? growthRatePerDay(firstDifficulty, lastDifficulty, 1) : null,
    difficultyGrowthRatePerDay: hasDifficulty ? growthRatePerDay(firstDifficulty, lastDifficulty, elapsedDays) : null,
    hashrateChange: hasHashrate ? growthRatePerDay(firstHashrate, lastHashrate, 1) : null,
  };
};

const buildPriceChange = (
  priceHistory: MiningTrendPricePoint[],
  cutoffMs: number,
  referenceMs: number,
): number | null => {
  const cutoffDate = toDateKey(cutoffMs);
  const referenceDate = toDateKey(referenceMs);
  const latestAcceptedPriceDate = toDateKey(referenceMs - DAY_MS);
  const windowPrices = priceHistory
    .filter(
      (point) =>
        point.date >= cutoffDate && point.date <= referenceDate && Number.isFinite(point.value) && point.value > 0,
    )
    .toSorted((first, second) => first.date.localeCompare(second.date));

  if (windowPrices.length < 2) return null;

  const firstPrice = windowPrices[0];
  const lastPrice = windowPrices[windowPrices.length - 1];
  if (firstPrice.date !== cutoffDate || lastPrice.date < latestAcceptedPriceDate) return null;

  return growthRatePerDay(firstPrice.value, lastPrice.value, 1);
};

export const buildMiningNetworkTrend = ({
  priceHistory,
  referenceAt,
  snapshots,
  windowDays,
}: BuildMiningNetworkTrendInput): MiningNetworkTrend | null => {
  const referenceMs = referenceAt.getTime();
  if (!Number.isFinite(referenceMs)) return null;

  const cutoffMs = referenceMs - windowDays * DAY_MS;
  const snapshotTrend = buildSnapshotTrend(snapshots, cutoffMs, referenceMs);
  const priceChange = buildPriceChange(priceHistory, cutoffMs, referenceMs);

  const trend: MiningNetworkTrend = { ...snapshotTrend, priceChange, windowDays };
  const hasAnyMetric =
    trend.blocksPerHour !== null ||
    trend.difficultyChange !== null ||
    trend.difficultyGrowthRatePerDay !== null ||
    trend.hashrateChange !== null ||
    trend.priceChange !== null;

  return hasAnyMetric ? trend : null;
};
