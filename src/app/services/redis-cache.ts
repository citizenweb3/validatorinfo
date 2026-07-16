import 'server-only';

import Redis from 'ioredis';

import logger from '@/logger';

const { logInfo, logWarn, logError } = logger('redis-cache');

let redis: Redis | null = null;

const getRedis = (): Redis => {
  if (!redis) {
    const host = process.env.REDIS_HOST ?? 'localhost';
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;

    logInfo(`Initializing Redis connection to ${host}:${port}`);

    redis = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logError(`Redis connection failed after ${times} retries`);
          return null;
        }
        return Math.min(times * 100, 1000);
      },
    });

    redis.on('error', (err) => {
      logError(`Redis error: ${err.message}`);
    });

    redis.on('connect', () => {
      logInfo('Redis connected');
    });
  }

  return redis;
};

const DEFAULT_TTL = 300; // 5 minutes

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await getRedis().get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (e) {
    logWarn(`Redis GET failed for key ${key}: ${e}`);
    return null;
  }
};

export const cacheSet = async <T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> => {
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (e) {
    logWarn(`Redis SET failed for key ${key}: ${e}`);
  }
};

export const cacheGetOrFetch = async <T>(
  key: string,
  fetchFn: () => Promise<T | null>,
  ttlSeconds: number = DEFAULT_TTL,
): Promise<T | null> => {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    logInfo(`Cache HIT for ${key}`);
    return cached;
  }

  logInfo(`Cache MISS for ${key}, fetching...`);
  const value = await fetchFn();

  if (value !== null) {
    await cacheSet(key, value, ttlSeconds);
  }

  return value;
};

/**
 * Check if a rate limit has been exceeded.
 * Uses INCR + conditional EXPIRE to avoid resetting the TTL on every request.
 * Fails closed: blocks requests if Redis is unavailable (protects paid APIs).
 * @returns true if limit exceeded, false if OK
 */
export const checkRateLimit = async (key: string, limit: number, windowSeconds: number): Promise<boolean> => {
  try {
    const client = getRedis();
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, windowSeconds);
    }
    return count > limit;
  } catch (e) {
    logError(`Redis rate limit UNAVAILABLE for key ${key} — blocking request: ${e}`);
    return true; // fail closed: block request if Redis is down (protects paid LLM API)
  }
};

export const CACHE_KEYS = {
  ai: {
    rateLimit: (ip: string) => `ai:rate:${ip}`,
    summaryRateLimit: (ip: string) => `ai:summary:rate:${ip}`,
  },
  aztec: {
    epochProgress: (chainName: string) => `aztec:${chainName}:epoch-progress`,
    activeAttesterCount: (chainName: string) => `aztec:${chainName}:active-attester-count`,
    committeeSize: (chainName: string) => `aztec:${chainName}:committee-size`,
    governanceConfig: (chainName: string) => `aztec:${chainName}:governance-config`,
    votingPower: (chainName: string) => `aztec:${chainName}:voting-power`,
    latestSlot: (chainName: string) => `aztec:${chainName}:latest-slot`,
    latestEpoch: (chainName: string) => `aztec:${chainName}:latest-epoch`,
    payloadUri: (chainName: string, address: string) => `aztec:${chainName}:payload-uri:${address}`,
  },
  txs: {
    // order-independent: the indexer predicate is `signers && ARRAY[...]` (array-overlap, commutative,
    // dedups), so [acc,op] and [op,acc] return identical rows. Do NOT sort if it ever becomes positional.
    // `chainName` namespaces the key: cosmoshub and atomone are separate indexer deployments, so the
    // same-shaped cursorKey must never collide across chains.
    byAddress: (chainName: string, addresses: string, cursorKey: string) =>
      `txs:byaddr:${chainName}:${addresses.split(',').sort().join(',')}:${cursorKey}`,
  },
  delegations: {
    byValidator: (chainName: string, validator: string, cursorKey: string) =>
      `deleg:byval:${chainName}:${validator}:${cursorKey}`,
    byDelegator: (chainName: string, delegator: string) => `deleg:bydelegator:${chainName}:${delegator}`,
  },
  lcd: {
    endpoints: (chainName: string) => `lcd:endpoints:${chainName}`,
    response: (chainName: string, pathHash: string) => `lcd:response:${chainName}:${pathHash}`,
  },
};

export const CACHE_TTL = {
  SHORT: 30,       // 30 seconds - for fast-changing data (slot, epoch, progress)
  MEDIUM: 300,     // 5 minutes - for moderately changing data
  LONG: 600,       // 10 minutes - for slow-changing data
  STATIC: 86400,   // 24 hours - for data that never changes (payloadUri)
  TXS_HEAD: 15,    // by-address head batch — mutable (new txs arrive at the top), keep fresh
  TXS_DEEP: 300,   // by-address cursor batch — immutable window, cache long
};
