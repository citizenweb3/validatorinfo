import { getAddress } from 'viem';
import Redis from 'ioredis';

import db, { eventsClient } from '@/db';
import logger from '@/logger';
import aztecIndexer from '@/services/aztec-indexer-api';
import { getRewardConfig } from '@/server/tools/chains/aztec/utils/get-reward-config';

const { logInfo, logError, logWarn } = logger('aztec-total-earned-rewards');

const BATCH_SIZE = 100;
const ZERO = BigInt(0);
const BPS_DIVISOR = BigInt(10000);
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const LONG_RETRY_DELAY_MS = 30000;
const MAX_CONSECUTIVE_FAILURES = 5;

const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: redisPort,
});

const getRedisKey = (chainName: string) => `aztec:${chainName}:total-earned-rewards:last-block`;

const resolveLastProcessedBlock = async (chainName: string, dbChainId: number): Promise<number> => {
  const redisKey = getRedisKey(chainName);

  const cached = await redis.get(redisKey);
  if (cached) {
    const height = parseInt(cached, 10);
    if (!isNaN(height) && height > 0) return height;
  }

  const chain = await db.chain.findFirst({
    where: { id: dbChainId },
    select: { totalRewardsLastBlock: true },
  });

  if (chain?.totalRewardsLastBlock) {
    const height = parseInt(chain.totalRewardsLastBlock, 10);
    if (!isNaN(height) && height > 0) {
      await redis.set(redisKey, String(height));
      return height;
    }
  }

  return 0;
};

const saveCursor = async (chainName: string, dbChainId: number, blockHeight: number): Promise<void> => {
  const heightStr = String(blockHeight);

  await db.chain.update({
    where: { id: dbChainId },
    data: { totalRewardsLastBlock: heightStr },
  });

  await redis.set(getRedisKey(chainName), heightStr);
};

export const getTotalEarnedRewards = async (
  chainName: 'aztec' | 'aztec-testnet',
  dbChain: { id: number },
): Promise<void> => {
  const latestHeight = await aztecIndexer.getLatestHeight();
  if (latestHeight === 0) {
    logWarn(`${chainName}: Latest height is 0, skipping`);
    return;
  }

  const lastProcessed = await resolveLastProcessedBlock(chainName, dbChain.id);

  if (lastProcessed >= latestHeight) {
    logInfo(`${chainName}: No new blocks to process (last=${lastProcessed}, latest=${latestHeight})`);
    return;
  }

  logInfo(`${chainName}: Processing blocks ${lastProcessed + 1} to ${latestHeight}`);

  const rewardConfig = await getRewardConfig(chainName);
  const rewardPerBlock = rewardConfig.blockReward * rewardConfig.sequencerBps / BPS_DIVISOR;

  logInfo(`${chainName}: rewardPerBlock=${rewardPerBlock}`);

  const stakedEvents = await eventsClient.aztecStakedEvent.findMany({
    where: { chainId: dbChain.id },
    select: { attesterAddress: true, coinbaseSplitContractAddress: true },
    orderBy: { blockNumber: 'desc' },
  });

  const coinbaseToOperator = new Map<string, string>();
  for (const event of stakedEvents) {
    if (!event.coinbaseSplitContractAddress) continue;
    try {
      const coinbase = getAddress(event.coinbaseSplitContractAddress).toLowerCase();
      const attester = getAddress(event.attesterAddress).toLowerCase();
      if (!coinbaseToOperator.has(coinbase)) {
        coinbaseToOperator.set(coinbase, attester);
      }
    } catch {}
  }

  const nodes = await db.node.findMany({
    where: { chainId: dbChain.id },
    select: { operatorAddress: true },
  });

  const operatorAddressSet = new Set<string>();
  for (const node of nodes) {
    try {
      operatorAddressSet.add(getAddress(node.operatorAddress).toLowerCase());
    } catch {}
  }

  logInfo(`${chainName}: ${coinbaseToOperator.size} coinbase mappings, ${operatorAddressSet.size} operator addresses`);

  const coinbaseBlockCount = new Map<string, number>();
  let currentFrom = lastProcessed + 1;

  let consecutiveFailures = 0;

  while (currentFrom <= latestHeight) {
    const limit = Math.min(BATCH_SIZE, latestHeight - currentFrom + 1);

    let blocks: Awaited<ReturnType<typeof aztecIndexer.getBlocks>> | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      blocks = await aztecIndexer.getBlocks({ from: currentFrom, limit });
      if (blocks && blocks.length > 0) break;
      logWarn(`${chainName}: No blocks returned for from=${currentFrom}, limit=${limit} (attempt ${attempt}/${MAX_RETRIES})`);
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }

    if (!blocks || blocks.length === 0) {
      consecutiveFailures++;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        logWarn(`${chainName}: ${MAX_CONSECUTIVE_FAILURES} consecutive failures at block ${currentFrom}, stopping`);
        break;
      }
      logWarn(`${chainName}: Retries exhausted for from=${currentFrom}, waiting ${LONG_RETRY_DELAY_MS / 1000}s before next attempt (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`);
      await new Promise((resolve) => setTimeout(resolve, LONG_RETRY_DELAY_MS));
      continue;
    }

    consecutiveFailures = 0;

    for (const block of blocks) {
      const coinbase = block.header.globalVariables.coinbase;
      if (!coinbase) continue;

      try {
        const normalizedCoinbase = getAddress(coinbase).toLowerCase();
        coinbaseBlockCount.set(normalizedCoinbase, (coinbaseBlockCount.get(normalizedCoinbase) || 0) + 1);
      } catch {}
    }

    const batchEnd = currentFrom + blocks.length - 1;
    await saveCursor(chainName, dbChain.id, batchEnd);

    logInfo(`${chainName}: Processed batch ${currentFrom}-${batchEnd} (${blocks.length} blocks)`);
    currentFrom = batchEnd + 1;
  }

  if (coinbaseBlockCount.size === 0) {
    logInfo(`${chainName}: No coinbase addresses found in new blocks`);
    return;
  }

  const operatorRewards = new Map<string, bigint>();
  let unmatchedBlocks = 0;

  coinbaseBlockCount.forEach((blockCount, coinbase) => {
    let operator: string | undefined;

    if (operatorAddressSet.has(coinbase)) {
      operator = coinbase;
    }

    if (!operator) {
      operator = coinbaseToOperator.get(coinbase);
    }

    if (!operator) {
      logWarn(`${chainName}: Unknown coinbase ${coinbase} (${blockCount} blocks) — no matching operator`);
      unmatchedBlocks += blockCount;
      return;
    }

    const reward = BigInt(blockCount) * rewardPerBlock;
    operatorRewards.set(operator, (operatorRewards.get(operator) || ZERO) + reward);
  });

  if (unmatchedBlocks > 0) {
    logWarn(`${chainName}: ${unmatchedBlocks} blocks from unknown coinbase addresses skipped`);
  }

  if (operatorRewards.size === 0) {
    logInfo(`${chainName}: No rewards to distribute (no matching operators)`);
    return;
  }

  logInfo(`${chainName}: Distributing rewards to ${operatorRewards.size} operators`);

  const operatorAddressList = Array.from(operatorRewards.keys());

  const existingNodes = await db.node.findMany({
    where: {
      chainId: dbChain.id,
      operatorAddress: { in: operatorAddressList.map((addr) => getAddress(addr)) },
    },
    select: { operatorAddress: true, totalEarnedRewards: true },
  });

  const existingRewardsMap = new Map<string, bigint>();
  for (const node of existingNodes) {
    try {
      const addr = getAddress(node.operatorAddress).toLowerCase();
      const existing = node.totalEarnedRewards ? BigInt(node.totalEarnedRewards) : ZERO;
      existingRewardsMap.set(addr, existing);
    } catch {}
  }

  const updates = Array.from(operatorRewards.entries()).map(([operator, newReward]) => {
    const existing = existingRewardsMap.get(operator) || ZERO;
    const total = existing + newReward;
    return db.node.updateMany({
      where: { operatorAddress: getAddress(operator) },
      data: { totalEarnedRewards: total.toString() },
    });
  });

  await db.$transaction(updates);

  logInfo(`${chainName}: Updated totalEarnedRewards for ${updates.length} nodes`);
};
