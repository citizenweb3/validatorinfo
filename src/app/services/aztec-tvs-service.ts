import prisma, { eventsClient } from '@/db';

const AZTEC_DELEGATION_AMOUNT = 200_000;
const START_DATE = new Date('2025-11-01');

export type PeriodType = 'day' | 'week' | 'month' | 'year';

export interface TvsDataPoint {
  date: string;
  tvs: number;
  totalStaked: number;
  totalSupply: number;
}

const getTotalSupply = async (chainName: string): Promise<number> => {
  const chain = await prisma.chain.findUnique({
    where: { name: chainName },
    include: { tokenomics: true },
  });

  if (!chain?.tokenomics?.totalSupply) {
    throw new Error(`Total supply not found for chain: ${chainName}`);
  }

  const totalSupplyWei = parseFloat(chain.tokenomics.totalSupply);
  const totalSupplyTokens = totalSupplyWei / Math.pow(10, 18);

  return totalSupplyTokens;
};

const getStakingEvents = async (chainId: number, startDate: Date) => {
  const events = await eventsClient.aztecStakedEvent.findMany({
    where: {
      chainId,
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  return events;
};

const calculateDailyTvs = (events: Array<{ timestamp: Date }>, totalSupply: number): TvsDataPoint[] => {
  const eventsByDate = new Map<string, number>();

  events.forEach((event) => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const currentCount = eventsByDate.get(dateKey) || 0;
    eventsByDate.set(dateKey, currentCount + 1);
  });

  const dataPoints: TvsDataPoint[] = [];
  let cumulativeStaked = 0;

  const sortedDates = Array.from(eventsByDate.keys()).sort();

  sortedDates.forEach((date) => {
    const eventsCount = eventsByDate.get(date) || 0;
    cumulativeStaked += eventsCount * AZTEC_DELEGATION_AMOUNT;

    const tvs = (cumulativeStaked / totalSupply) * 100;

    dataPoints.push({
      date,
      tvs,
      totalStaked: cumulativeStaked,
      totalSupply,
    });
  });

  return dataPoints;
};


const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

const aggregateByPeriod = (dailyData: TvsDataPoint[], period: PeriodType): TvsDataPoint[] => {
  if (period === 'day') {
    return dailyData;
  }

  const aggregated = new Map<string, TvsDataPoint>();

  dailyData.forEach((point) => {
    const date = new Date(point.date);
    let key: string;

    if (period === 'week') {
      key = getWeekStart(date);
    } else if (period === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = String(date.getFullYear());
    }

    const existing = aggregated.get(key);
    if (!existing || new Date(point.date) > new Date(existing.date)) {
      aggregated.set(key, {
        date: key,
        tvs: point.tvs,
        totalStaked: point.totalStaked,
        totalSupply: point.totalSupply,
      });
    }
  });

  return Array.from(aggregated.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const getTvsData = async (chainName: string, period: PeriodType = 'day'): Promise<TvsDataPoint[]> => {
  try {
    const chain = await prisma.chain.findUnique({
      where: { name: chainName },
    });

    if (!chain) {
      throw new Error(`Chain not found: ${chainName}`);
    }

    const totalSupply = await getTotalSupply(chainName);

    const events = await getStakingEvents(chain.id, START_DATE);

    const dailyTvs = calculateDailyTvs(events, totalSupply);

    const aggregatedData = aggregateByPeriod(dailyTvs, period);

    return aggregatedData;
  } catch (error) {
    console.error('Error getting TVS data:', error);
    throw error;
  }
};

const aztecTvsService = {
  getTvsData,
};

export default aztecTvsService;
