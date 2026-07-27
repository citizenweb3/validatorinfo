import { createHash } from 'node:crypto';
import 'server-only';

import db from '@/db';
import { CACHE_KEYS, CACHE_TTL, cacheGetOrFetch } from '@/services/redis-cache';
import { fetchJsonWithFailover } from '@/utils/lcd-request';

const MAX_REST_ENDPOINTS = 10;

export type LcdJsonLoader = <T>(path: string) => Promise<T>;

const getRestEndpoints = async (chainName: string): Promise<string[]> => {
  const key = CACHE_KEYS.lcd.endpoints(chainName);
  const endpoints = await cacheGetOrFetch<string[]>(
    key,
    async () => {
      const nodes = await db.chainNode.findMany({
        where: { type: 'rest', chain: { name: chainName } },
        select: { url: true },
        orderBy: { id: 'asc' },
        take: MAX_REST_ENDPOINTS,
      });
      return Array.from(new Set(nodes.map((node) => node.url.trim()).filter(Boolean)));
    },
    CACHE_TTL.LONG,
  );

  return endpoints ?? [];
};

export const createLcdJsonLoader = async (chainName: string): Promise<LcdJsonLoader> => {
  const normalizedChainName = chainName.toLowerCase();
  const endpoints = await getRestEndpoints(normalizedChainName);
  if (endpoints.length === 0) throw new Error(`no REST endpoints are configured for ${normalizedChainName}`);

  return async <T>(path: string): Promise<T> => {
    const pathHash = createHash('sha256').update(path).digest('hex');
    const key = CACHE_KEYS.lcd.response(normalizedChainName, pathHash);
    const value = await cacheGetOrFetch<T>(key, () => fetchJsonWithFailover<T>(endpoints, path), CACHE_TTL.SHORT);

    if (value === null) throw new Error(`LCD response was empty for ${normalizedChainName}`);
    return value;
  };
};

export const fetchLcdJson = async <T>(chainName: string, path: string): Promise<T> => {
  const loadJson = await createLcdJsonLoader(chainName);
  return loadJson<T>(path);
};
