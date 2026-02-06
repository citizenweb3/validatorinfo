import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { getTotalSupply } from '@/server/tools/chains/aztec/utils/get-total-supply';
import { getTotalStakedForDay } from '@/server/tools/chains/aztec/utils/get-total-staked-for-day';
import { syncTvsToTokenomics } from '@/server/tools/chains/aztec/utils/sync-tvs-to-tokenomics';

const { logInfo, logError, logWarn } = logger('update-aztec-tvs-history');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;
const ZERO = BigInt(0);

const getStartDate = async (chainId: number): Promise<Date> => {
  const lastRecord = await db.chainTvsHistory.findFirst({
    where: { chainId },
    orderBy: { date: 'desc' },
  });

  if (lastRecord) {
    const nextDay = new Date(lastRecord.date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
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
  startDate.setUTCHours(0, 0, 0, 0);
  return startDate;
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
      endDate.setUTCDate(endDate.getUTCDate() - 1);
      endDate.setUTCHours(0, 0, 0, 0);

      if (startDate > endDate) {
        logInfo(`${chainName}: TVS history is up to date`);
        continue;
      }

      logInfo(`${chainName}: Processing TVS from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

      const totalSupply = await getTotalSupply(chainName);

      const currentDate = new Date(startDate);
      let recordsCount = 0;

      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];

        try {
          const totalStaked = await getTotalStakedForDay(dbChain.id, currentDate);

          const tvsPercent = totalSupply > ZERO
            ? (Number(totalStaked) / Number(totalSupply)) * 100
            : 0;

          const recordDate = new Date(dateKey + 'T00:00:00.000Z');

          await db.chainTvsHistory.upsert({
            where: {
              chainId_date: {
                chainId: dbChain.id,
                date: recordDate,
              },
            },
            update: {
              tvs: tvsPercent,
              totalStaked: totalStaked.toString(),
              totalSupply: totalSupply.toString(),
            },
            create: {
              chainId: dbChain.id,
              date: recordDate,
              tvs: tvsPercent,
              totalStaked: totalStaked.toString(),
              totalSupply: totalSupply.toString(),
            },
          });

          recordsCount++;
        } catch (dayError: any) {
          logError(`${chainName}: Error processing ${dateKey}: ${dayError.message}`);
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      logInfo(`${chainName}: ✓ Saved ${recordsCount} TVS history records`);

      await syncTvsToTokenomics(dbChain.id, chainName);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec TVS history update completed');
};

export default updateAztecTvsHistory;
