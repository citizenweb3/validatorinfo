import Redis from 'ioredis';

import db from '@/db';
import { ChainNodeType } from '@/server/tools/chains/chain-indexer';

interface EndpointCache {
  endpoints: string[];
  currentIndex: number;
  retryCount: number;
}

const MAX_RETRIES = 2;

const redis = new Redis({
  host: 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  // password: 'your_secure_password',
});

const CACHE_TTL = 3600;

const getChainEndpoint = async (chainName: string, type: ChainNodeType): Promise<string> => {
  const cacheKey = `endpoints:${chainName}:${type}`;

  const cached = await redis.get(cacheKey);
  let cache: EndpointCache;

  if (cached) {
    cache = JSON.parse(cached);
  } else {
    const endpoints = (
      await db.chainNode.findMany({
        where: {
          chain: {
            name: chainName,
          },
          type,
        },
        select: {
          type: true,
          url: true,
        },
      })
    )
      .filter((node) => node.type === type)
      .map((node) => node.url);

    if (endpoints.length === 0) {
      throw new Error(`No endpoints found for chain ${chainName} and type ${type}`);
    }

    cache = {
      endpoints,
      currentIndex: 0,
      retryCount: 0,
    };

    await redis.set(cacheKey, JSON.stringify(cache), 'EX', CACHE_TTL);
  }

  const { endpoints, currentIndex } = cache;
  const currentEndpoint = endpoints[currentIndex];

  cache.currentIndex = (currentIndex + 1) % endpoints.length;
  if (cache.currentIndex === 0) {
    cache.retryCount += 1;
  }

  if (cache.retryCount < MAX_RETRIES) {
    await redis.set(cacheKey, JSON.stringify(cache), 'EX', CACHE_TTL);
  } else {
    await redis.del(cacheKey);
  }

  return currentEndpoint;
};

export default getChainEndpoint;
