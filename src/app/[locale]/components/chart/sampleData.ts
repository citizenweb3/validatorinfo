import * as d3 from 'd3';
import { DataPoint } from '@/components/chart/chartUtils';



class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}

const priceDataCache: Map<string, { [token: string]: DataPoint[] }> = new Map();

export const generateSampleData = (
  startDate: Date,
  endDate: Date,
  chartType: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly',
  tokens: string[],
  options?: {
    regenerate?: boolean;
    startingPrice?: number;
    volatility?: number;
  }
): { [token: string]: DataPoint[] } => {
  const {
    regenerate = false,
    startingPrice = 100,
    volatility = 0.05, // 5% daily volatility
  } = options || {};

  const cacheKey = `${startDate.getTime()}-${endDate.getTime()}-${chartType}-${tokens.join('-')}-${startingPrice}-${volatility}`;
  if (!regenerate && priceDataCache.has(cacheKey)) {
    return priceDataCache.get(cacheKey)!;
  }

  const generateSeed = (startDate: Date, endDate: Date, token: string): number =>
    startDate.getTime() + endDate.getTime() + token.charCodeAt(0);

  const getNextPrice = (prevPrice: number, volatility: number, rng: SeededRandom): number => {
    const change = 1 + (rng.next() - 0.5) * 2 * volatility;
    return Math.max(prevPrice * change, 0.01); // Ensure price doesn't go below 0.01
  };

  let dates: Date[] = [];
  switch (chartType) {
    case 'Daily':
      dates = d3.timeDay.range(startDate, d3.timeDay.offset(endDate, 1));
      break;
    case 'Weekly':
      dates = d3.timeWeek.range(startDate, d3.timeWeek.offset(endDate, 1));
      break;
    case 'Monthly':
      dates = d3.timeMonth.range(startDate, d3.timeMonth.offset(endDate, 1));
      break;
    case 'Yearly':
      dates = d3.timeYear.range(startDate, d3.timeYear.offset(endDate, 1));
      break;
  }

  const result: { [token: string]: DataPoint[] } = {};

  tokens.forEach(token => {
    const seed = generateSeed(startDate, endDate, token);
    const rng = new SeededRandom(seed);
    let prevPrice = startingPrice;

    const priceSeries: DataPoint[] = dates.map(date => {
      const price = getNextPrice(prevPrice, volatility, rng);
      prevPrice = price;
      return { date: new Date(date), value: price };
    });

    result[token] = priceSeries;
  });

  priceDataCache.set(cacheKey, result);
  return result;
};