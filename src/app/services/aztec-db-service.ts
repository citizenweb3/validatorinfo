import { getAddress } from 'viem';

import prisma, { eventsClient } from '@/db';

const AZTEC_DELEGATION_AMOUNT = 200_000;
const START_DATE = new Date('2025-11-10');

export type PeriodType = 'day' | 'week' | 'month' | 'year';

export interface TvsDataPoint {
  date: string;
  tvs: number;
  totalStaked: number;
  totalSupply: number;
}

export interface StakedEventItem {
  address: string;
  amount: number;
  happened: string;
  txHash: string;
  blockHeight: string;
}

export interface ChartDataPoint {
  date: string;
  tvs: number;
  apr: number;
  validatorsCount: number;
}

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} min. ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

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

const getValidatorQueuedEvents = async (chainId: number, startDate: Date) => {
  const events = await eventsClient.aztecValidatorQueuedEvent.findMany({
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

const getWithdrawFinalizedEvents = async (chainId: number, startDate: Date) => {
  const events = await eventsClient.aztecWithdrawFinalizedEvent.findMany({
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

const getSlashedEvents = async (chainId: number, startDate: Date) => {
  const events = await eventsClient.aztecSlashedEvent.findMany({
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

const calculateDailyTvs = (
  queuedEvents: Array<{ timestamp: Date }>,
  withdrawEvents: Array<{ timestamp: Date }>,
  slashedEvents: Array<{ timestamp: Date; amount: string }>,
  totalSupply: number,
): TvsDataPoint[] => {
  const validatorChangeByDate = new Map<string, number>();

  queuedEvents.forEach((event) => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const currentCount = validatorChangeByDate.get(dateKey) || 0;
    validatorChangeByDate.set(dateKey, currentCount + 1);
  });

  withdrawEvents.forEach((event) => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const currentCount = validatorChangeByDate.get(dateKey) || 0;
    validatorChangeByDate.set(dateKey, currentCount - 1);
  });

  const slashedByDate = new Map<string, number>();

  slashedEvents.forEach((event) => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const currentSlashed = slashedByDate.get(dateKey) || 0;
    const slashedTokens = Number(BigInt(event.amount)) / Math.pow(10, 18);
    slashedByDate.set(dateKey, currentSlashed + slashedTokens);
  });

  const allDates = new Set<string>();
  Array.from(validatorChangeByDate.keys()).forEach((date) => allDates.add(date));
  Array.from(slashedByDate.keys()).forEach((date) => allDates.add(date));

  const stakedByDate = new Map<string, number>();
  let cumulativeStaked = 0;
  let cumulativeSlashed = 0;

  const sortedDates = Array.from(allDates).sort();

  sortedDates.forEach((date) => {
    const validatorChange = validatorChangeByDate.get(date) || 0;
    const slashedAmount = slashedByDate.get(date) || 0;

    cumulativeStaked += validatorChange * AZTEC_DELEGATION_AMOUNT;
    cumulativeSlashed += slashedAmount;

    const netStaked = cumulativeStaked - cumulativeSlashed;
    if (netStaked < 0) {
      stakedByDate.set(date, 0);
    } else {
      stakedByDate.set(date, netStaked);
    }
  });

  const dataPoints: TvsDataPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(START_DATE);
  currentDate.setHours(0, 0, 0, 0);

  let lastStakedValue = 0;

  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split('T')[0];

    if (stakedByDate.has(dateKey)) {
      lastStakedValue = stakedByDate.get(dateKey)!;
    }

    const tvs = lastStakedValue > 0 ? (lastStakedValue / totalSupply) * 100 : 0;

    dataPoints.push({
      date: dateKey,
      tvs,
      totalStaked: lastStakedValue,
      totalSupply,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

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

    const [queuedEvents, withdrawEvents, slashedEvents] = await Promise.all([
      getValidatorQueuedEvents(chain.id, START_DATE),
      getWithdrawFinalizedEvents(chain.id, START_DATE),
      getSlashedEvents(chain.id, START_DATE),
    ]);

    const dailyTvs = calculateDailyTvs(queuedEvents, withdrawEvents, slashedEvents, totalSupply);

    const aggregatedData = aggregateByPeriod(dailyTvs, period);

    return aggregatedData;
  } catch (error) {
    console.error('Error getting TVS data:', error);
    throw error;
  }
};

const getStakedEventByAttester = async (
  attesterAddress: string,
  chainName: string,
): Promise<StakedEventItem | null> => {
  try {
    const chain = await prisma.chain.findUnique({
      where: { name: chainName },
    });

    if (!chain) {
      console.error(`Chain not found: ${chainName}`);
      return null;
    }

    const checksumAddress = getAddress(attesterAddress);

    const event = await eventsClient.aztecValidatorQueuedEvent.findFirst({
      where: {
        chainId: chain.id,
        attester: checksumAddress,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!event) {
      return null;
    }

    return {
      address: event.attester,
      amount: AZTEC_DELEGATION_AMOUNT,
      happened: formatTimeAgo(event.timestamp),
      txHash: event.transactionHash,
      blockHeight: event.blockNumber,
    };
  } catch (error) {
    console.error('Error fetching staked event by attester:', error);
    return null;
  }
};

const getTvsHistoryFromDb = async (chainId: number): Promise<Map<string, number>> => {
  const records = await prisma.chainTvsHistory.findMany({
    where: { chainId },
    orderBy: { date: 'asc' },
  });

  const tvsMap = new Map<string, number>();
  for (const r of records) {
    const dateKey = r.date.toISOString().split('T')[0];
    tvsMap.set(dateKey, r.tvs);
  }

  return tvsMap;
};

const getAprHistoryFromDb = async (chainId: number): Promise<Map<string, number>> => {
  const records = await prisma.chainAprHistory.findMany({
    where: { chainId },
    orderBy: { date: 'asc' },
  });

  const aprMap = new Map<string, number>();
  for (const r of records) {
    const dateKey = r.date.toISOString().split('T')[0];
    // APR stored as decimal (0.05 = 5%), convert to percentage
    aprMap.set(dateKey, r.apr * 100);
  }

  return aprMap;
};

const getValidatorsHistory = async (chainId: number): Promise<Map<string, number>> => {
  const records = await prisma.chainValidatorsHistory.findMany({
    where: { chainId },
    orderBy: { date: 'asc' },
  });

  const validatorsMap = new Map<string, number>();
  for (const r of records) {
    const dateKey = r.date.toISOString().split('T')[0];
    validatorsMap.set(dateKey, r.validatorsCount);
  }

  return validatorsMap;
};

const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T00:00:00.000Z');

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const getChartData = async (chainName: string): Promise<ChartDataPoint[]> => {
  const chain = await prisma.chain.findUnique({
    where: { name: chainName },
  });

  if (!chain) {
    console.error(`Chain not found: ${chainName}`);
    return [];
  }

  const [tvsMap, aprMap, validatorsMap] = await Promise.all([
    getTvsHistoryFromDb(chain.id),
    getAprHistoryFromDb(chain.id),
    getValidatorsHistory(chain.id),
  ]);

  if (tvsMap.size === 0 && aprMap.size === 0 && validatorsMap.size === 0) {
    return [];
  }

  const allDates = new Set([
    ...Array.from(tvsMap.keys()),
    ...Array.from(aprMap.keys()),
    ...Array.from(validatorsMap.keys()),
  ]);
  const sortedDates = Array.from(allDates).sort();

  if (sortedDates.length === 0) {
    return [];
  }

  const startDate = sortedDates[0];
  const endDate = sortedDates[sortedDates.length - 1];
  const continuousDates = generateDateRange(startDate, endDate);

  const dailyData: ChartDataPoint[] = [];
  let lastTvs = 0;
  let lastApr = 0;
  let lastValidatorsCount = 0;

  for (const date of continuousDates) {
    const tvs = tvsMap.has(date) ? tvsMap.get(date)! : lastTvs;
    const apr = aprMap.has(date) ? aprMap.get(date)! : lastApr;
    const validatorsCount = validatorsMap.has(date) ? validatorsMap.get(date)! : lastValidatorsCount;

    dailyData.push({ date, tvs, apr, validatorsCount });

    lastTvs = tvs;
    lastApr = apr;
    lastValidatorsCount = validatorsCount;
  }

  return dailyData;
};

const getCurrentValidatorsCount = async (chainName: string): Promise<number> => {
  const chain = await prisma.chain.findUnique({
    where: { name: chainName },
  });

  if (!chain) {
    console.error(`Chain not found: ${chainName}`);
    return 0;
  }

  const latestRecord = await prisma.chainValidatorsHistory.findFirst({
    where: { chainId: chain.id },
    orderBy: { date: 'desc' },
  });

  return latestRecord?.validatorsCount ?? 0;
};

const aztecDbService = {
  getTvsData,
  getStakedEventByAttester,
  getChartData,
  getCurrentValidatorsCount,
};

export default aztecDbService;
