import { eventsClient } from '@/db';
import { SortDirection } from '@/server/types';

interface SlashingEventFilters {
  chainId?: number;
  attester?: string;
  fromBlock?: bigint;
  toBlock?: bigint;
  fromDate?: Date;
  toDate?: Date;
}

interface SlashingEventStats {
  totalEvents: number;
  uniqueValidators: number;
  totalSlashed: bigint;
  firstSlash: Date | null;
  lastSlash: Date | null;
}

const getSlashingEvents = async (
  filters: SlashingEventFilters = {},
  skip: number = 0,
  take: number = 10,
  sortBy: string = 'timestamp',
  order: SortDirection = 'desc',
) => {
  const where: any = {};

  if (filters.chainId) {
    where.chainId = filters.chainId;
  }

  if (filters.attester) {
    where.attester = { equals: filters.attester, mode: 'insensitive' };
  }

  if (filters.fromBlock || filters.toBlock) {
    where.blockNumber = {};
    if (filters.fromBlock) {
      where.blockNumber.gte = filters.fromBlock.toString();
    }
    if (filters.toBlock) {
      where.blockNumber.lte = filters.toBlock.toString();
    }
  }

  if (filters.fromDate || filters.toDate) {
    where.timestamp = {};
    if (filters.fromDate) {
      where.timestamp.gte = filters.fromDate;
    }
    if (filters.toDate) {
      where.timestamp.lte = filters.toDate;
    }
  }

  const [events, totalCount] = await Promise.all([
    eventsClient.aztecSlashedEvent.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
    }),
    eventsClient.aztecSlashedEvent.count({ where }),
  ]);

  return {
    events,
    totalCount,
    pages: Math.ceil(totalCount / take),
  };
};

const getSlashingStats = async (chainId: number): Promise<SlashingEventStats> => {
  const result = await eventsClient.aztecSlashedEvent.aggregate({
    where: { chainId },
    _count: { id: true },
    _min: { timestamp: true },
    _max: { timestamp: true },
  });

  const events = await eventsClient.aztecSlashedEvent.findMany({
    where: { chainId },
    select: { attester: true, amount: true },
  });

  const uniqueValidators = new Set(events.map((e) => e.attester.toLowerCase())).size;
  const totalSlashed = events.reduce((sum, e) => sum + BigInt(e.amount), BigInt(0));

  return {
    totalEvents: result._count.id,
    uniqueValidators,
    totalSlashed,
    firstSlash: result._min.timestamp,
    lastSlash: result._max.timestamp,
  };
};

const getValidatorSlashingHistory = async (
  chainId: number,
  attesterAddress: string,
  skip: number = 0,
  take: number = 10,
) => {
  const where = {
    chainId,
    attester: { equals: attesterAddress, mode: 'insensitive' as const },
  };

  const [events, totalCount] = await Promise.all([
    eventsClient.aztecSlashedEvent.findMany({
      where,
      skip,
      take,
      orderBy: { timestamp: 'desc' },
    }),
    eventsClient.aztecSlashedEvent.count({ where }),
  ]);

  const totalSlashed = events.reduce((sum, e) => sum + BigInt(e.amount), BigInt(0));

  return {
    events,
    totalCount,
    totalSlashed,
    pages: Math.ceil(totalCount / take),
  };
};

const getRecentSlashingEvents = async (chainId: number, limit: number = 10) => {
  return eventsClient.aztecSlashedEvent.findMany({
    where: { chainId },
    take: limit,
    orderBy: { timestamp: 'desc' },
  });
};

const getSlashingByValidator = async (chainId: number) => {
  const events = await eventsClient.aztecSlashedEvent.findMany({
    where: { chainId },
    select: {
      attester: true,
      amount: true,
      timestamp: true,
    },
    orderBy: { timestamp: 'desc' },
  });

  const grouped = events.reduce(
    (acc, event) => {
      const key = event.attester.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          attester: event.attester,
          count: 0,
          totalSlashed: BigInt(0),
          lastSlash: event.timestamp,
        };
      }
      acc[key].count++;
      acc[key].totalSlashed += BigInt(event.amount);
      if (event.timestamp > acc[key].lastSlash) {
        acc[key].lastSlash = event.timestamp;
      }
      return acc;
    },
    {} as Record<string, { attester: string; count: number; totalSlashed: bigint; lastSlash: Date }>,
  );

  return Object.values(grouped).sort((a, b) => b.count - a.count);
};

const SlashingEventService = {
  getSlashingEvents,
  getSlashingStats,
  getValidatorSlashingHistory,
  getRecentSlashingEvents,
  getSlashingByValidator,
};

export default SlashingEventService;
