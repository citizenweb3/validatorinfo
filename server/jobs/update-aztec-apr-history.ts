import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { AztecBlock } from '@/services/aztec-indexer-api';
import { countBlocksForDay } from '@/server/tools/chains/aztec/utils/count-blocks-for-day';
import {
  AztecIndexerUnavailableError,
  getLatestFinalizedBlock,
} from '@/server/tools/chains/aztec/utils/get-latest-finalized-block';
import { getRewardConfig } from '@/server/tools/chains/aztec/utils/get-reward-config';
import { getTotalStakedForDay } from '@/server/tools/chains/aztec/utils/get-total-staked-for-day';
import { syncAprToTokenomics } from '@/server/tools/chains/aztec/utils/sync-apr-to-tokenomics';
import { getAztecBlockHeight, getAztecTimestampMs, getUtcDayStart } from '@/utils/aztec';

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

const getLatestFinalizedDay = (latestFinalizedBlock: AztecBlock): Date => {
  return getUtcDayStart(getAztecTimestampMs(latestFinalizedBlock.header.globalVariables.timestamp));
};

const writeIndexerUnavailableAprRecord = async (
  chainId: number,
  recordDate: Date,
  latestFinalizedBlock: AztecBlock,
): Promise<number> => {
  const prevRecord = await db.chainAprHistory.findFirst({
    where: { chainId, date: { lt: recordDate } },
    orderBy: { date: 'desc' },
  });

  const latestFinalizedDay = getLatestFinalizedDay(latestFinalizedBlock);
  const fallbackApr = prevRecord?.apr ?? 0;

  await db.chainAprHistory.upsert({
    where: { chainId_date: { chainId, date: recordDate } },
    create: {
      chainId,
      date: recordDate,
      apr: fallbackApr,
      blocksCount: 0,
      rewards: '0',
      totalStaked: prevRecord?.totalStaked ?? '0',
      metadata: {
        indexerUnavailable: true,
        latestFinalizedDate: latestFinalizedDay.toISOString().split('T')[0],
      },
    },
    update: {
      apr: fallbackApr,
      blocksCount: 0,
      rewards: '0',
      totalStaked: prevRecord?.totalStaked ?? '0',
      metadata: {
        indexerUnavailable: true,
        latestFinalizedDate: latestFinalizedDay.toISOString().split('T')[0],
      },
    },
  });

  return fallbackApr;
};

const recalculateZeroRecords = async (
  chainId: number,
  chainName: string,
  rewardConfig: { blockReward: bigint; sequencerBps: bigint },
  latestFinalizedBlock: AztecBlock,
) => {
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

  const latestFinalizedDay = getLatestFinalizedDay(latestFinalizedBlock);
  let recalculated = 0;

  for (const record of zeroRecords) {
    const dateKey = record.date.toISOString().split('T')[0];

    if (record.date.getTime() > latestFinalizedDay.getTime()) {
      logWarn(`${chainName}: Latest finalized Aztec block only covers ${latestFinalizedDay.toISOString().split('T')[0]}, stopping recalculation`);
      break;
    }

    try {
      const blocksCount = await countBlocksForDay(record.date, { latestFinalizedBlock });

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
    } catch (error) {
      if (error instanceof AztecIndexerUnavailableError) {
        logWarn(`${chainName}: ${error.message}, stopping recalculation`);
        break;
      }

      logError(`${chainName}: Error recalculating ${dateKey}: ${error instanceof Error ? error.message : String(error)}`);
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
      const latestFinalizedBlock = await getLatestFinalizedBlock();
      const latestFinalizedHeight = getAztecBlockHeight(latestFinalizedBlock.height);
      const latestFinalizedDay = getLatestFinalizedDay(latestFinalizedBlock);

      logInfo(`${chainName}: blockReward=${rewardConfig.blockReward}, sequencerBps=${rewardConfig.sequencerBps}`);
      logInfo(`${chainName}: latest finalized height=${latestFinalizedHeight}, latest finalized day=${latestFinalizedDay.toISOString().split('T')[0]}`);

      await recalculateZeroRecords(dbChain.id, chainName, rewardConfig, latestFinalizedBlock);

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
        const recordDate = new Date(`${dateKey}T00:00:00.000Z`);

        try {
          if (recordDate.getTime() > latestFinalizedDay.getTime()) {
            const fallbackApr = await writeIndexerUnavailableAprRecord(dbChain.id, recordDate, latestFinalizedBlock);
            logWarn(`${chainName}: ${dateKey} - finalized indexer data stops at ${latestFinalizedDay.toISOString().split('T')[0]}, using previous APR=${(fallbackApr * 100).toFixed(2)}%`);
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            continue;
          }

          const blocksCount = await countBlocksForDay(currentDate, { latestFinalizedBlock });
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
        } catch (error) {
          if (error instanceof AztecIndexerUnavailableError) {
            const fallbackApr = await writeIndexerUnavailableAprRecord(dbChain.id, recordDate, latestFinalizedBlock);
            logWarn(`${chainName}: ${dateKey} - ${error.message}, using previous APR=${(fallbackApr * 100).toFixed(2)}%`);
          } else {
            logError(`${chainName}: Error processing ${dateKey}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      logInfo(`${chainName}: ✓ APR history update completed`);
      await syncAprToTokenomics(dbChain.id, chainName);
    } catch (error) {
      logError(`Error processing ${chainName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  logInfo('Aztec APR history update completed');
};

export default updateAztecAprHistory;
