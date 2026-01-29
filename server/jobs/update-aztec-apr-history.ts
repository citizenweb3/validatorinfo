import db, { eventsClient } from '@/db';
import logger from '@/logger';
import aztecIndexer from '@/services/aztec-indexer-api';
import { getOrCreateViemClient } from '@/server/utils/viem-client-with-failover';
import { contracts, rollupAbis, getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError, logWarn } = logger('update-aztec-apr-history');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;
const AZTEC_DELEGATION_AMOUNT = BigInt(200_000);
const DAYS_IN_YEAR = 365;
const ZERO = BigInt(0);
const WEI_MULTIPLIER = BigInt(10 ** 18);
const BPS_DIVISOR = BigInt(10000);

interface RewardConfig {
  blockReward: bigint;
  sequencerBps: bigint;
}

interface DayAprData {
  date: Date;
  apr: number;
  blocksCount: number;
  rewards: bigint;
  totalStaked: bigint;
  avgCommission: number;
  metadata: Record<string, string>;
}

const getStartDate = async (chainId: number): Promise<Date> => {
  const lastRecord = await db.chainAprHistory.findFirst({
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

interface RewardConfigResult {
  rewardDistributor: `0x${string}`;
  sequencerBps: number; // uint32 returned as number by viem
  booster: `0x${string}`;
  blockReward: bigint; // uint96 returned as bigint by viem
}

const getRewardConfig = async (chainName: string): Promise<RewardConfig> => {
  const l1ChainName = getL1[chainName];
  const l1Chain = getChainParams(l1ChainName);
  const l1RpcUrls = l1Chain.nodes
    .filter((n: any) => n.type === 'rpc')
    .map((n: any) => n.url);

  const client = getOrCreateViemClient(l1RpcUrls, 'apr-history');
  const contractConfig = contracts[chainName as keyof typeof contracts];
  const abi = rollupAbis[chainName as keyof typeof rollupAbis];

  const config = await client.readContract({
    address: contractConfig.rollupAddress as `0x${string}`,
    abi,
    functionName: 'getRewardConfig',
  }) as RewardConfigResult;

  return {
    sequencerBps: BigInt(config.sequencerBps),
    blockReward: config.blockReward,
  };
};

const countBlocksForDay = async (targetDate: Date): Promise<number> => {
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const startTs = Math.floor(dayStart.getTime() / 1000);
  const endTs = Math.floor(dayEnd.getTime() / 1000);

  const latestHeight = await aztecIndexer.getLatestHeight();
  if (latestHeight === 0) return 0;

  let low = 1;
  let high = latestHeight;
  let firstBlockInDay = -1;
  let lastBlockInDay = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await aztecIndexer.getBlockByHeight(mid);
    if (!block) {
      low = mid + 1;
      continue;
    }

    const blockTs = Math.floor(Number(block.header.globalVariables.timestamp) / 1000);

    if (blockTs >= startTs) {
      firstBlockInDay = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (firstBlockInDay === -1) return 0;

  while (firstBlockInDay > 1) {
    const prevBlock = await aztecIndexer.getBlockByHeight(firstBlockInDay - 1);
    if (!prevBlock) break;
    const prevTs = Math.floor(Number(prevBlock.header.globalVariables.timestamp) / 1000);
    if (prevTs >= startTs) {
      firstBlockInDay--;
    } else {
      break;
    }
  }

  low = firstBlockInDay;
  high = latestHeight;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await aztecIndexer.getBlockByHeight(mid);
    if (!block) {
      high = mid - 1;
      continue;
    }

    const blockTs = Math.floor(Number(block.header.globalVariables.timestamp) / 1000);

    if (blockTs <= endTs) {
      lastBlockInDay = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (lastBlockInDay === -1 || lastBlockInDay < firstBlockInDay) return 0;

  while (lastBlockInDay < latestHeight) {
    const nextBlock = await aztecIndexer.getBlockByHeight(lastBlockInDay + 1);
    if (!nextBlock) break;
    const nextTs = Math.floor(Number(nextBlock.header.globalVariables.timestamp) / 1000);
    if (nextTs <= endTs) {
      lastBlockInDay++;
    } else {
      break;
    }
  }

  return lastBlockInDay - firstBlockInDay + 1;
};

const getTotalStakedForDay = async (chainId: number, date: Date): Promise<bigint> => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [queuedEvents, withdrawEvents, slashedEvents] = await Promise.all([
    eventsClient.aztecValidatorQueuedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
    eventsClient.aztecWithdrawFinalizedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
    eventsClient.aztecSlashedEvent.findMany({
      where: { chainId, timestamp: { lte: endOfDay } },
    }),
  ]);

  let totalStaked = ZERO;

  totalStaked += BigInt(queuedEvents.length) * AZTEC_DELEGATION_AMOUNT * WEI_MULTIPLIER;
  totalStaked -= BigInt(withdrawEvents.length) * AZTEC_DELEGATION_AMOUNT * WEI_MULTIPLIER;

  for (const event of slashedEvents) {
    totalStaked -= BigInt(event.amount);
  }

  return totalStaked < ZERO ? ZERO : totalStaked;
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
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(0, 0, 0, 0);

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
          const totalStaked = await getTotalStakedForDay(dbChain.id, currentDate);

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

        currentDate.setDate(currentDate.getDate() + 1);
      }

      logInfo(`${chainName}: ✓ APR history update completed`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec APR history update completed');
};

export default updateAztecAprHistory;
