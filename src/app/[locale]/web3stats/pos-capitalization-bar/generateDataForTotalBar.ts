import * as d3 from 'd3';
import { DataPoint } from '../chartUtils/barChartUtils';
import { formatNumber } from '../chartUtils/chartHelper';

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}

const dataCache: Map<string, { tvs: DataPoint[]; rewards: DataPoint[] }> = new Map();

export const generateDataForTotalLine = (
  startDate: Date,
  endDate: Date,
  chartType: string,
  regenerate: boolean = false
): { tvs: DataPoint[]; rewards: DataPoint[] } => {
  const baseValue = 5 * 10 ** 10;
  const MAX_VALUE = 1e12;
  const MAX_FLUCTUATION = 1e10;

  const cacheKey = `${startDate.getTime()}-${endDate.getTime()}-${chartType}`;
  if (!regenerate && dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey)!;
  }

  const generateSeed = (startDate: Date, endDate: Date): number => {
    return startDate.getTime() + endDate.getTime();
  };

  const getFluctuatingValue = (prevValue: number, maxFluctuation: number, rng: SeededRandom) => {
    const fluctuation = (rng.next() - 0.5) * 2 * maxFluctuation;
    const newValue = prevValue + fluctuation;
    return Math.min(Math.max(newValue, 1), MAX_VALUE);
  };

  // Determine dates based on chart type
  let dates: Date[];

  switch (chartType) {
    case 'Daily':
      dates = d3.timeDay.range(startDate, d3.timeDay.offset(endDate, 1)); // Daily range
      break;
    case 'Weekly':
      // Adjust endDate to the start of the next week to avoid partial week at the end
      const adjustedEndDate = d3.timeWeek.offset(d3.timeWeek.floor(endDate), 1);
      dates = d3.timeWeek.range(startDate, adjustedEndDate); // Weekly range
      break;
    case 'Monthly':
      // Adjust to the next month's start
      dates = d3.timeMonth.range(startDate, d3.timeMonth.offset(endDate, 1)); // Monthly range
      break;
    case 'Yearly':
      // Adjust to the next year's start
      dates = d3.timeYear.range(startDate, d3.timeYear.offset(endDate, 1)); // Yearly range
      break;
    default:
      dates = d3.timeMonth.range(startDate, d3.timeMonth.offset(endDate, 1)); // Default to monthly
  }

  const seed = generateSeed(startDate, endDate);
  const rng = new SeededRandom(seed);
  let prevTvsValue = baseValue;
  let prevRewardsValue = baseValue;

  const dataset: { date: Date; tvs: number; rewards: number; formattedTvsValue: string; formattedRewardsValue: string }[] = [];
  for (const date of dates) {
    const tvsValue = getFluctuatingValue(prevTvsValue, MAX_FLUCTUATION, rng);
    const rewardsValue = getFluctuatingValue(prevRewardsValue, MAX_FLUCTUATION, rng);
    prevTvsValue = tvsValue;
    prevRewardsValue = rewardsValue;
    dataset.push({
      date: new Date(date),
      tvs: tvsValue,
      rewards: rewardsValue,
      formattedTvsValue: formatNumber(tvsValue),
      formattedRewardsValue: formatNumber(rewardsValue),
    });
  }

  const result = {
    tvs: dataset.map(d => ({ date: d.date, value: d.tvs, formattedValue: d.formattedTvsValue })),
    rewards: dataset.map(d => ({ date: d.date, value: d.rewards, formattedValue: d.formattedRewardsValue })),
  };

  dataCache.set(cacheKey, result);
  return result;
};

