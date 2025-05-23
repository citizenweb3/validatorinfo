import * as d3 from 'd3';
import { DataPoint } from '@/app/components/chart/chartUtils';

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

const dataCache: Map<string, { [ecosystem: string]: DataPoint[] }> = new Map();

export const generateDataForDominanceLine = (
  startDate: Date,
  endDate: Date,
  chartType: string,
  ecosystems: string[],
  regenerate: boolean = false
): { [ecosystem: string]: DataPoint[] } => {
    const baseValue = Math.random() * (80 - 20) + 20;; // Starting with a mid-range value (0-100)
  const MAX_FLUCTUATION = 10; // Adjust fluctuation range as needed

  const cacheKey = `${startDate.getTime()}-${endDate.getTime()}-${chartType}-${ecosystems.join('-')}`;
  if (!regenerate && dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey)!;
  }

  const generateSeed = (startDate: Date, endDate: Date, ecosystem: string): number => {
    const ecoHash = Array.from(ecosystem).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return startDate.getTime() + endDate.getTime() + ecoHash;
  };
  

  const getFluctuatingValue = (prevValue: number, maxFluctuation: number, rng: SeededRandom) => {
    const fluctuation = (rng.next() - 0.5) * 2 * maxFluctuation;
    const newValue = prevValue + fluctuation;
    return Math.min(Math.max(newValue, 0), 100); // Clamped to 0-100 range
  };

  // Determine dates based on chart type
  let dates: Date[];

  switch (chartType) {
    case 'Daily':
      dates = d3.timeDay.range(startDate, d3.timeDay.offset(endDate, 1)); // Daily range
      break;
    case 'Weekly':
      const adjustedEndDate = d3.timeWeek.offset(d3.timeWeek.floor(endDate), 1);
      dates = d3.timeWeek.range(startDate, adjustedEndDate); // Weekly range
      break;
    case 'Monthly':
      dates = d3.timeMonth.range(startDate, d3.timeMonth.offset(endDate, 1)); // Monthly range
      break;
    case 'Yearly':
      dates = d3.timeYear.range(startDate, d3.timeYear.offset(endDate, 1)); // Yearly range
      break;
    default:
      dates = d3.timeMonth.range(startDate, d3.timeMonth.offset(endDate, 1)); // Default to monthly
  }

  const result: { [ecosystem: string]: DataPoint[] } = {};

  ecosystems.forEach(ecosystem => {
    const seed = generateSeed(startDate, endDate, ecosystem);
    const rng = new SeededRandom(seed);
    let prevValue = baseValue;

    const dataset: DataPoint[] = [];
    for (const date of dates) {
      const value = getFluctuatingValue(prevValue, MAX_FLUCTUATION, rng);
      dataset.push({ date: new Date(date), value });
      prevValue = value;
    }

    result[ecosystem] = dataset;
  });

  dataCache.set(cacheKey, result);
  return result;
};