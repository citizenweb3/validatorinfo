import db, { eventsClient } from '@/db';
import logger from '@/logger';
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

      const startDate = await getStartDate(dbChain.id);
      const endDate = new Date();
      endDate.setUTCDate(endDate.getUTCDate() - 1);
      endDate.setUTCHours(0, 0, 0, 0);

      if (startDate > endDate) {
        logInfo(`${chainName}: APR history is up to date`);
        continue;
      }

      logInfo(`${chainName}: Processing APR from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

      const rewardConfig = await getRewardConfig(chainName);

      logInfo(`${chainName}: blockReward=${rewardConfig.blockReward}, sequencerBps=${rewardConfig.sequencerBps}`);

      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];

        try {
          const blocksCount = await countBlocksForDay(currentDate);
          const totalStaked = await getTotalStakedForDay(dbChain.id, currentDate, 'reward-earning');

          const rewards = BigInt(blocksCount) * rewardConfig.blockReward * rewardConfig.sequencerBps / BPS_DIVISOR;

          let apr = 0;
          if (totalStaked > ZERO && rewards > ZERO) {
            const dailyReturn = Number(rewards) / Number(totalStaked);
            apr = dailyReturn * DAYS_IN_YEAR;
          }

          const recordDate = new Date(currentDate.toISOString().split('T')[0] + 'T00:00:00.000Z');

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

          const existing = await db.chainAprHistory.findUnique({
            where: {
              chainId_date: {
                chainId: dbChain.id,
                date: recordDate,
              },
            },
          });

          if (existing) {
            await db.chainAprHistory.update({
              where: { id: existing.id },
              data: recordData,
            });
          } else {
            await db.chainAprHistory.create({
              data: {
                chainId: dbChain.id,
                date: recordDate,
                ...recordData,
              },
            });
          }

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
