import db from '@/db';
import logger from '@/logger';

const { logDebug } = logger('price-history-service');

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

const fillGaps = (points: { date: string; value: number }[]): { date: string; value: number }[] => {
  if (points.length < 2) return points;

  const result: { date: string; value: number }[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    let nextDay = addDays(points[i - 1].date, 1);
    while (nextDay < points[i].date) {
      result.push({ date: nextDay, value: result[result.length - 1].value });
      nextDay = addDays(nextDay, 1);
    }
    result.push(points[i]);
  }

  return result;
};

const getChartData = async (chainId: number): Promise<{ date: string; value: number }[]> => {
  const priceHistory = await db.priceHistory.findMany({
    where: { chainId },
    orderBy: { date: 'asc' },
  });

  const lastHistoryDate = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].date : null;

  const prices = await db.price.findMany({
    where: {
      chainId,
      ...(lastHistoryDate ? { createdAt: { gt: lastHistoryDate } } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });

  const mergedByDate = new Map<string, number>();

  for (const ph of priceHistory) {
    const dayKey = ph.date.toISOString().split('T')[0];
    mergedByDate.set(dayKey, ph.value);
  }

  for (const price of prices) {
    const d = price.createdAt;
    const dayKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    mergedByDate.set(dayKey, price.value);
  }

  const sorted = Array.from(mergedByDate.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const filled = fillGaps(sorted);

  logDebug(
    `Chart data for chain ${chainId}: ${filled.length} points (${priceHistory.length} history + ${prices.length} price records, ${filled.length - sorted.length} gaps filled)`,
  );

  return filled;
};

const priceHistoryService = {
  getChartData,
};

export default priceHistoryService;
