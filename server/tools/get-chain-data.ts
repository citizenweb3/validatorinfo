import Redis from 'ioredis';

import db from '@/db';
import logger from '@/logger';
import { ChainNodeType } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

const { logDebug, logWarn, logInfo } = logger('fetch-chain-data');

interface EndpointCache {
  endpoints: string[];
  currentIndex: number;
  retryCount: number;
}

// Подключение к Redis
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: redisPort,
  // password: process.env.REDIS_PASSWORD,
});

const fetchChainData = async <T>(chainName: string, urlType: ChainNodeType, url: string): Promise<T> => {
  const cacheKey = `endpoints:${chainName}:${urlType}`;

  let cache: EndpointCache | null = null;
  const cached = await redis.get(cacheKey);
  if (cached) {
    cache = JSON.parse(cached);
  } else {
    logInfo('Cache miss, querying DB');
    const endpoints = (
      await db.chainNode.findMany({
        where: {
          chain: {
            name: chainName,
          },
          type: urlType,
        },
        select: {
          type: true,
          url: true,
        },
      })
    )
      .filter((node) => node.type === urlType)
      .map((node) => node.url);

    if (endpoints.length === 0) {
      throw new Error(`No endpoints found for chain ${chainName} and type ${urlType}`);
    }

    cache = {
      endpoints,
      currentIndex: 0,
      retryCount: 0,
    };

    await redis.set(cacheKey, JSON.stringify(cache), 'EX', 3600);
  }

  if (!cache) {
    throw new Error(`No endpoints found for chain ${chainName} and type ${urlType}`);
  }

  const { endpoints } = cache;
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    const fullUrl = endpoint + url;

    try {
      const data = await fetchData<T>(fullUrl);
      if (data) {
        logDebug(`Data fetched from ${fullUrl}: ${JSON.stringify(data)}`);
        return data;
      } else {
        logWarn(`No data returned from ${fullUrl}`);
      }
    } catch (e) {
      logWarn(`Attempt ${i + 1} failed for ${chainName} ${urlType} at ${fullUrl}: ${e}`);
    }
  }

  cache.retryCount += 1;
  if (cache.retryCount >= 2) {
    await redis.del(cacheKey);
  } else {
    await redis.set(cacheKey, JSON.stringify(cache), 'EX', 3600);
  }

  throw new Error(
    `No working endpoints available for ${chainName} ${urlType} after trying all ${endpoints.length} endpoints`,
  );
};

export default fetchChainData;
