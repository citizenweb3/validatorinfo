import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import Redis from 'ioredis';

import db from '@/db';
import logger from '@/logger';


const { logDebug, logWarn, logInfo } = logger('get-tendermint-client');

interface EndpointCache {
  endpoints: string[];
  currentIndex: number;
  retryCount: number;
}

const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: redisPort,
  // password: process.env.REDIS_PASSWORD,
});

const CACHE_TTL = 3600;

const getTendermintClient = async (chainName: string): Promise<Tendermint34Client> => {
  const cacheKey = `endpoints:${chainName}:rpc`;

  let cache: EndpointCache | null = null;
  const cached = await redis.get(cacheKey);
  if (cached) {
    cache = JSON.parse(cached);
    logInfo(`Cache hit for RPC endpoints: ${cache?.endpoints}`);
  } else {
    logInfo('Cache miss, querying DB');
    const endpoints = (
      await db.chainNode.findMany({
        where: {
          chain: { name: chainName },
          type: 'rpc',
        },
        select: { type: true, url: true },
      })
    )
      .filter((node) => node.type === 'rpc')
      .map((node) => node.url);

    if (endpoints.length === 0) {
      throw new Error(`No RPC endpoints found for chain ${chainName}`);
    }

    cache = {
      endpoints,
      currentIndex: 0,
      retryCount: 0,
    };

    await redis.set(cacheKey, JSON.stringify(cache), 'EX', CACHE_TTL);
  }

  if (!cache) {
    throw new Error(`No endpoints found for chain ${chainName}`);
  }

  const { endpoints } = cache;
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    logInfo(`Attempt ${i + 1} of ${endpoints.length} connecting to: ${endpoint}`);

    try {
      const tmClient = await Tendermint34Client.connect(endpoint);

      const status = await tmClient.status();
      const height = status?.syncInfo?.latestBlockHeight ?? 0;

      logDebug(
        `Connected to ${endpoint} for ${chainName}, latest height: ${height}, network: ${status?.nodeInfo?.network}, version: ${status?.nodeInfo?.version}`,
      );

      cache.currentIndex = (i + 1) % endpoints.length;
      cache.retryCount = 0;
      await redis.set(cacheKey, JSON.stringify(cache), 'EX', CACHE_TTL);

      return tmClient;
    } catch (e) {
      logWarn(`Attempt ${i + 1} failed for ${chainName} at ${endpoint}: ${e}`);
    }
  }

  cache.retryCount += 1;
  if (cache.retryCount >= 2) {
    logWarn(`Invalidating RPC cache for ${chainName} after repeated failures`);
    await redis.del(cacheKey);
  } else {
    await redis.set(cacheKey, JSON.stringify(cache), 'EX', CACHE_TTL);
  }

  throw new Error(`No working RPC endpoints available for ${chainName} after trying all ${endpoints.length} endpoints`);
};

export default getTendermintClient;
