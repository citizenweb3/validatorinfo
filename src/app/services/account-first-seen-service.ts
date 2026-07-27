import 'server-only';

import db from '@/db';
import logger from '@/logger';
import { getAccountIndexerFactsClient } from '@/services/account-indexer-facts';
import { CACHE_KEYS, CACHE_TTL, cacheGetOrFetch } from '@/services/redis-cache';
import { type AccountFirstSeen, selectFirstSeenCandidate } from '@/utils/account-history';

const { logError } = logger('account-first-seen-service');

type CachedFirstSeen = { value: AccountFirstSeen | null };

const getGenesisFirstSeen = async (chainName: string, address: string): Promise<AccountFirstSeen | null> => {
  const snapshot = await db.genesisSnapshot.findFirst({
    where: {
      status: 'ready',
      chain: { name: chainName },
      accounts: { some: { address } },
    },
    select: { initialHeight: true, boundaryTime: true },
  });
  if (!snapshot) return null;

  return {
    height: snapshot.initialHeight.toString(),
    time: snapshot.boundaryTime.toISOString(),
    atOrBefore: chainName === 'cosmoshub',
    source: 'genesis',
  };
};

const loadFirstSeen = async (chainName: string, address: string): Promise<CachedFirstSeen> => {
  const client = getAccountIndexerFactsClient(chainName);
  if (!client) return { value: null };

  const [genesis, indexedResponse] = await Promise.all([
    getGenesisFirstSeen(chainName, address),
    client.getEarliestActivity(address, { cache: 'no-store', timeout: 30_000 }),
  ]);
  const indexedActivity = indexedResponse?.data.earliest;
  const indexed: AccountFirstSeen | null = indexedActivity
    ? {
        height: indexedActivity.height,
        time: indexedActivity.time,
        atOrBefore: false,
        source: 'indexed',
      }
    : null;

  return { value: selectFirstSeenCandidate(genesis, indexed) };
};

const firstSeenInflight = new Map<string, Promise<AccountFirstSeen | null>>();

export const getFirstSeen = (chainName: string, address: string): Promise<AccountFirstSeen | null> => {
  const normalizedChainName = chainName.toLowerCase();
  const normalizedAddress = address.trim();
  if (!getAccountIndexerFactsClient(normalizedChainName)) return Promise.resolve(null);
  if (normalizedAddress.length < 8 || normalizedAddress.length > 128) return Promise.resolve(null);

  const key = CACHE_KEYS.account.firstSeen(normalizedChainName, normalizedAddress);
  const existing = firstSeenInflight.get(key);
  if (existing) return existing;

  const promise = cacheGetOrFetch<CachedFirstSeen>(
    key,
    () => loadFirstSeen(normalizedChainName, normalizedAddress),
    CACHE_TTL.STATIC,
  )
    .then((cached) => cached?.value ?? null)
    .catch((error: unknown) => {
      logError(`Failed to load first-seen data for ${normalizedChainName}`, error);
      return null;
    })
    .finally(() => firstSeenInflight.delete(key));

  firstSeenInflight.set(key, promise);
  return promise;
};

const AccountFirstSeenService = { getFirstSeen };

export default AccountFirstSeenService;
