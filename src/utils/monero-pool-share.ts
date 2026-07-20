import type { MoneroPoolShareSeries } from '@/services/monero-service';

export type PoolSharePeriod = 'day' | 'week' | 'month' | 'year';

const toUtcDate = (date: string): Date => new Date(`${date}T00:00:00.000Z`);

const periodKey = (dateString: string, period: PoolSharePeriod): string => {
  if (period === 'day') return dateString;

  const date = toUtcDate(dateString);
  if (period === 'week') {
    const weekday = date.getUTCDay();
    const offset = weekday === 0 ? -6 : 1 - weekday;
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  }
  if (period === 'month') {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;
  }
  return `${date.getUTCFullYear()}-01-01`;
};

export const aggregatePoolShareSeries = (
  series: MoneroPoolShareSeries[],
  period: PoolSharePeriod,
): MoneroPoolShareSeries[] => {
  if (period === 'day') return series;

  return series.map((poolSeries) => {
    const buckets = new Map<string, { blocksFound: number; networkBlocks: number }>();
    for (const point of poolSeries.points) {
      const key = periodKey(point.date, period);
      const bucket = buckets.get(key) ?? { blocksFound: 0, networkBlocks: 0 };
      bucket.blocksFound += point.blocksFound;
      bucket.networkBlocks += point.networkBlocks;
      buckets.set(key, bucket);
    }

    return {
      pool: poolSeries.pool,
      points: Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, bucket]) => ({
          date,
          blocksFound: bucket.blocksFound,
          networkBlocks: bucket.networkBlocks,
          sharePercent: bucket.networkBlocks > 0
            ? (bucket.blocksFound / bucket.networkBlocks) * 100
            : 0,
        })),
    };
  });
};

export const getUniquePoolShareDates = (series: MoneroPoolShareSeries[]): string[] =>
  Array.from(new Set(series.flatMap((poolSeries) => poolSeries.points.map((point) => point.date)))).sort();
