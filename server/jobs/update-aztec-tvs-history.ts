import db, { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo, logError, logWarn } = logger('update-aztec-tvs-history');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;
const AZTEC_DELEGATION_AMOUNT = BigInt(200_000);
const ZERO = BigInt(0);
const WEI_MULTIPLIER = BigInt(10 ** 18);

interface DayData {
  date: Date;
  totalStaked: bigint;
  totalSupply: bigint;
  tvs: number;
}

const getStartDate = async (chainId: number): Promise<Date> => {
  const lastRecord = await db.chainTvsHistory.findFirst({
    where: { chainId },
    orderBy: { date: 'desc' },
  });

  if (lastRecord) {
    const nextDay = new Date(lastRecord.date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }

  const firstEvent = await eventsClient.aztecValidatorQueuedEvent.findFirst({
    where: { chainId },
    orderBy: { timestamp: 'asc' },
  });

  if (!firstEvent) {
    throw new Error('No ValidatorQueued events found');
  }

  const startDate = new Date(firstEvent.timestamp);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

const getTotalSupply = async (chainId: number): Promise<bigint> => {
  const chain = await db.chain.findFirst({
    where: { id: chainId },
    include: { tokenomics: true },
  });

  if (!chain?.tokenomics?.totalSupply) {
    throw new Error('Total supply not found');
  }

  return BigInt(chain.tokenomics.totalSupply);
};

const calculateDailyTvs = async (
  chainId: number,
  startDate: Date,
  endDate: Date,
  totalSupply: bigint,
): Promise<DayData[]> => {
  const [queuedEvents, withdrawEvents, slashedEvents] = await Promise.all([
    eventsClient.aztecValidatorQueuedEvent.findMany({
      where: { chainId, timestamp: { lte: endDate } },
      orderBy: { timestamp: 'asc' },
    }),
    eventsClient.aztecWithdrawFinalizedEvent.findMany({
      where: { chainId, timestamp: { lte: endDate } },
      orderBy: { timestamp: 'asc' },
    }),
    eventsClient.aztecSlashedEvent.findMany({
      where: { chainId, timestamp: { lte: endDate } },
      orderBy: { timestamp: 'asc' },
    }),
  ]);

  const changesByDate = new Map<string, bigint>();

  for (const event of queuedEvents) {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const current = changesByDate.get(dateKey) || ZERO;
    changesByDate.set(dateKey, current + AZTEC_DELEGATION_AMOUNT * WEI_MULTIPLIER);
  }

  for (const event of withdrawEvents) {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const current = changesByDate.get(dateKey) || ZERO;
    changesByDate.set(dateKey, current - AZTEC_DELEGATION_AMOUNT * WEI_MULTIPLIER);
  }

  for (const event of slashedEvents) {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const current = changesByDate.get(dateKey) || ZERO;
    changesByDate.set(dateKey, current - BigInt(event.amount));
  }

  let cumulativeStaked = ZERO;
  const allDates = Array.from(changesByDate.keys()).sort();

  for (const dateKey of allDates) {
    if (dateKey >= startDate.toISOString().split('T')[0]) break;
    cumulativeStaked += changesByDate.get(dateKey) || ZERO;
    if (cumulativeStaked < ZERO) cumulativeStaked = ZERO;
  }

  const result: DayData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];

    const change = changesByDate.get(dateKey) || ZERO;
    cumulativeStaked += change;
    if (cumulativeStaked < ZERO) cumulativeStaked = ZERO;

    const tvsPercent = totalSupply > ZERO
      ? (Number(cumulativeStaked) / Number(totalSupply)) * 100
      : 0;

    result.push({
      date: new Date(dateKey + 'T00:00:00.000Z'),
      totalStaked: cumulativeStaked,
      totalSupply,
      tvs: tvsPercent,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

const updateAztecTvsHistory = async () => {
  logInfo('Starting Aztec TVS history update');

  for (const chainName of AZTEC_CHAINS) {
    try {
      const dbChain = await db.chain.findFirst({
        where: { name: chainName },
      });

      if (!dbChain) {
        logWarn(`Chain ${chainName} not found in database`);
        continue;
      }

      const startDate = await getStartDate(dbChain.id);

      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(0, 0, 0, 0);

      if (startDate > endDate) {
        logInfo(`${chainName}: TVS history is up to date`);
        continue;
      }

      logInfo(`${chainName}: Processing TVS from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

      const totalSupply = await getTotalSupply(dbChain.id);
      const dailyData = await calculateDailyTvs(dbChain.id, startDate, endDate, totalSupply);

      for (const day of dailyData) {
        await db.chainTvsHistory.upsert({
          where: {
            chainId_date: {
              chainId: dbChain.id,
              date: day.date,
            },
          },
          update: {
            tvs: day.tvs,
            totalStaked: day.totalStaked.toString(),
            totalSupply: day.totalSupply.toString(),
          },
          create: {
            chainId: dbChain.id,
            date: day.date,
            tvs: day.tvs,
            totalStaked: day.totalStaked.toString(),
            totalSupply: day.totalSupply.toString(),
          },
        });
      }

      logInfo(`${chainName}: ✓ Saved ${dailyData.length} TVS history records`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec TVS history update completed');
};

export default updateAztecTvsHistory;
