import db, { eventsClient } from '@/db';
import logger from '@/logger';
import aztecIndexer from '@/services/aztec-indexer-api';
import { countBlocksForDay } from '@/server/tools/chains/aztec/utils/count-blocks-for-day';
import { getRewardConfig } from '@/server/tools/chains/aztec/utils/get-reward-config';
import { getTotalStakedForDay } from '@/server/tools/chains/aztec/utils/get-total-staked-for-day';
import { syncAprToTokenomics } from '@/server/tools/chains/aztec/utils/sync-apr-to-tokenomics';

const { logInfo, logError, logWarn } = logger('update-aztec-apr-history');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;
const DAYS_IN_YEAR = 365;
const ZERO = BigInt(0);
const BPS_DIVISOR = BigInt(10000);

const getStartDate = async (chainId: number): Promise<Date> => {
  const lastRecord = await db.chainAprHistory.findFirst({
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

const recalculateZeroRecords = async (
  chainId: number,
  chainName: string,
  rewardConfig: { blockReward: bigint; sequencerBps: bigint },
) => {
  // Find records with blocksCount = 0 or null (written when indexer was down)
  const zeroRecords = await db.chainAprHistory.findMany({
    where: {
      chainId,
      OR: [
        { blocksCount: 0 },
        { blocksCount: null },
      ],
    },
    orderBy: { date: 'asc' },
  });

  if (zeroRecords.length === 0) {
    logInfo(`${chainName}: No zero-block records to recalculate`);
    return;
  }

  logInfo(`${chainName}: Found ${zeroRecords.length} zero-block records to recalculate`);

  // Check if indexer is available before attempting recalculation
  const latestHeight = await aztecIndexer.getLatestHeight();
  if (latestHeight === 0) {
    logWarn(`${chainName}: Indexer unavailable, skipping recalculation`);
    return;
  }

  let recalculated = 0;

  for (const record of zeroRecords) {
    const dateKey = record.date.toISOString().split('T')[0];

    try {
      const blocksCount = await countBlocksForDay(record.date);

      // Skip if still 0 (day genuinely had no blocks)
      if (blocksCount === 0) {
        logInfo(`${chainName}: ${dateKey} - confirmed 0 blocks, skipping`);
        continue;
      }

      const totalStaked = await getTotalStakedForDay(chainId, record.date, 'reward-earning');
      const rewards = BigInt(blocksCount) * rewardConfig.blockReward * rewardConfig.sequencerBps / BPS_DIVISOR;

      let apr = 0;
      if (totalStaked > ZERO && rewards > ZERO) {
        const dailyReturn = Number(rewards) / Number(totalStaked);
        apr = dailyReturn * DAYS_IN_YEAR;
      }

      await db.chainAprHistory.update({
        where: { id: record.id },
        data: {
          apr,
          blocksCount,
          rewards: rewards.toString(),
          totalStaked: totalStaked.toString(),
          metadata: {
            blockReward: rewardConfig.blockReward.toString(),
            sequencerBps: rewardConfig.sequencerBps.toString(),
          },
        },
      });

      recalculated++;
      logInfo(`${chainName}: ${dateKey} - recalculated: blocks=${blocksCount}, apr=${(apr * 100).toFixed(2)}%`);
    } catch (err: any) {
      logError(`${chainName}: Error recalculating ${dateKey}: ${err.message}`);
    }
  }

  logInfo(`${chainName}: Recalculated ${recalculated}/${zeroRecords.length} zero-block records`);
};

const updateAztecAprHistory = async () => {
  logInfo('Starting Aztec APR history update');

  for (const chainName of AZTEC_CHAINS) {
    try {
      const dbChain = await db.chain.findFirst({
        where: { name: chainName },
      });

      if (!dbChain) {
        logWarn(`Chain ${chainName} not found in database`);
        continue;
      }

      const rewardConfig = await getRewardConfig(chainName);

      logInfo(`${chainName}: blockReward=${rewardConfig.blockReward}, sequencerBps=${rewardConfig.sequencerBps}`);

      // Recalculate previously failed records before processing new days
      await recalculateZeroRecords(dbChain.id, chainName, rewardConfig);

      const startDate = await getStartDate(dbChain.id);
      const endDate = new Date();
      endDate.setUTCDate(endDate.getUTCDate() - 1);
      endDate.setUTCHours(0, 0, 0, 0);

      if (startDate > endDate) {
        logInfo(`${chainName}: APR history is up to date`);
        await syncAprToTokenomics(dbChain.id, chainName);
        continue;
      }

      logInfo(`${chainName}: Processing APR from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];

        try {
          const recordDate = new Date(currentDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
          const blocksCount = await countBlocksForDay(currentDate);

          // Indexer down: carry forward previous day's APR, keep blocksCount=0 for later recalculation
          if (blocksCount === 0) {
            const latestHeight = await aztecIndexer.getLatestHeight();
            if (latestHeight === 0) {
              const prevRecord = await db.chainAprHistory.findFirst({
                where: { chainId: dbChain.id, date: { lt: recordDate } },
                orderBy: { date: 'desc' },
              });

              const fallbackApr = prevRecord?.apr ?? 0;

              await db.chainAprHistory.upsert({
                where: { chainId_date: { chainId: dbChain.id, date: recordDate } },
                create: {
                  chainId: dbChain.id,
                  date: recordDate,
                  apr: fallbackApr,
                  blocksCount: 0,
                  rewards: '0',
                  totalStaked: prevRecord?.totalStaked ?? '0',
                  metadata: { indexerDown: true },
                },
                update: {
                  apr: fallbackApr,
                  blocksCount: 0,
                  rewards: '0',
                  totalStaked: prevRecord?.totalStaked ?? '0',
                  metadata: { indexerDown: true },
                },
              });

              logWarn(`${chainName}: ${dateKey} - indexer down, using previous APR=${(fallbackApr * 100).toFixed(2)}%`);
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
              continue;
            }
          }

          const totalStaked = await getTotalStakedForDay(dbChain.id, currentDate, 'reward-earning');
          const rewards = BigInt(blocksCount) * rewardConfig.blockReward * rewardConfig.sequencerBps / BPS_DIVISOR;

          let apr = 0;
          if (totalStaked > ZERO && rewards > ZERO) {
            const dailyReturn = Number(rewards) / Number(totalStaked);
            apr = dailyReturn * DAYS_IN_YEAR;
          }

          const recordData = {
            apr,
            blocksCount,
            rewards: rewards.toString(),
            totalStaked: totalStaked.toString(),
            metadata: {
              blockReward: rewardConfig.blockReward.toString(),
              sequencerBps: rewardConfig.sequencerBps.toString(),
            },
          };

          await db.chainAprHistory.upsert({
            where: { chainId_date: { chainId: dbChain.id, date: recordDate } },
            create: {
              chainId: dbChain.id,
              date: recordDate,
              ...recordData,
            },
            update: recordData,
          });

          logInfo(`${chainName}: ${dateKey} - blocks=${blocksCount}, apr=${(apr * 100).toFixed(2)}%`);
        } catch (dayError: any) {
          logError(`${chainName}: Error processing ${dateKey}: ${dayError.message}`);
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      logInfo(`${chainName}: ✓ APR history update completed`);

      await syncAprToTokenomics(dbChain.id, chainName);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec APR history update completed');
};

export default updateAztecAprHistory;
