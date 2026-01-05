import Redis from 'ioredis';

import logger from '@/logger';
import getActiveAttesterCountUtil from '@/server/tools/chains/aztec/utils/get-active-attester-count';
import getCommitteeSizeUtil from '@/server/tools/chains/aztec/utils/get-committee-size';
import getCurrentEpoch from '@/server/tools/chains/aztec/utils/get-current-epoch';
import getCurrentSlot from '@/server/tools/chains/aztec/utils/get-current-slot';
import getEpochProgressUtil, { EpochProgress } from '@/server/tools/chains/aztec/utils/get-epoch-progress';

const { logError, logInfo, logWarn } = logger('aztec-contracts-service');

const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: redisPort,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      logWarn('Redis connection failed after 3 retries, continuing without cache');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

redis.on('error', (error) => {
  logWarn(`Redis connection error: ${error.message}`);
});

redis.on('connect', () => {
  logInfo('Redis connected successfully');
});

const getLatestSlot = async (chainName: string) => {
  const latestSlot = await getCurrentSlot(chainName);
  if (!latestSlot) {
    return null;
  }
  return String(latestSlot);
};

const getLatestEpoch = async (chainName: string) => {
  const latestEpoch = await getCurrentEpoch(chainName);
  if (!latestEpoch) {
    return null;
  }
  return String(latestEpoch);
};

const getActiveAttesterCount = async (chainName: string) => {
  const activeAttesterCount = await getActiveAttesterCountUtil(chainName);
  if (!activeAttesterCount) {
    return null;
  }
  return Number(activeAttesterCount);
};

const getCommitteeSize = async (chainName: string) => {
  const cacheKey = `aztec:${chainName}:committee-size`;
  const CACHE_TTL = 3600;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      logInfo(`Committee size cache hit for ${chainName}`);
      return Number(cached);
    }
  } catch (e) {
    logError(`Redis cache read error: ${e}`);
  }

  const comitteeSize = await getCommitteeSizeUtil(chainName);
  if (!comitteeSize) {
    return null;
  }

  const committeeSizeNumber = Number(comitteeSize);

  try {
    await redis.set(cacheKey, committeeSizeNumber.toString(), 'EX', CACHE_TTL);
    logInfo(`Committee size cached for ${chainName}: ${committeeSizeNumber}`);
  } catch (e) {
    logError(`Redis cache write error: ${e}`);
  }

  return committeeSizeNumber;
};

const getEpochProgress = async (chainName: string): Promise<EpochProgress | null> => {
  return getEpochProgressUtil(chainName);
};

const aztecContractService = {
  getLatestSlot,
  getLatestEpoch,
  getActiveAttesterCount,
  getEpochProgress,
  getCommitteeSize,
};

export default aztecContractService;
