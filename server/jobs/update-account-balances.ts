import { Prisma } from '@prisma/client';
import Redis from 'ioredis';

import db from '@/db';
import logger from '@/logger';
import {
  type JobAccountBalanceContext,
  type JobAccountBalanceJsonOverride,
  createJobAccountBalanceContext,
} from '@/server/tools/account-balance-lcd';
import {
  type AccountVisitBufferRedis,
  type AccountVisitSnapshot,
  readAccountVisitSnapshot,
  removeUnchangedAccountVisits,
} from '@/utils/account-visit-buffer';
import { normalizeBech32Address } from '@/utils/bech32-address';
import {
  ACCOUNT_BALANCE_CHAIN_NAMES,
  type CosmosAccountBalanceParts,
  fetchCosmosAccountBalanceParts,
} from '@/utils/cosmos-account-balances';

const { logInfo, logWarn, logError } = logger('update-account-balances');

const REFRESH_BATCH = 50;
const REFRESH_CONCURRENCY = 5;
const CLEANUP_BATCH = 200;
const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const RETENTION_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
const BACKLOG_WARNING_THRESHOLD = REFRESH_BATCH * 6;

export interface AccountBalanceRedis extends AccountVisitBufferRedis {
  disconnect(): void;
}

type AccountBalanceJobOptions = {
  redis?: AccountBalanceRedis;
  loadJsonOverride?: JobAccountBalanceJsonOverride;
  now?: () => Date;
};

type RefreshedAccountBalance = {
  id: number;
  parts: CosmosAccountBalanceParts;
  refreshedAt: Date;
};

const createRedisClient = (): AccountBalanceRedis => {
  const port = process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT, 10) : 6379;
  const redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });
  redis.on('error', (error) => logError('Redis error while refreshing account balances', error));
  return redis;
};

const upsertAccountVisits = async (
  context: JobAccountBalanceContext,
  snapshot: readonly AccountVisitSnapshot[],
): Promise<number> => {
  const validVisits = snapshot.flatMap((entry) => {
    if (!entry.viewedAt) return [];
    const address = normalizeBech32Address(entry.address, context.bech32Prefix);
    if (!address) return [];
    return [{ address, viewedAt: entry.viewedAt }];
  });
  if (validVisits.length === 0) return 0;

  const rows = Prisma.join(
    validVisits.map(
      (visit) => Prisma.sql`(${context.chainId}, ${visit.address}, ${context.minimalDenom}, ${visit.viewedAt})`,
    ),
  );
  await db.$executeRaw`
    INSERT INTO "account_balances" ("chain_id", "address", "denom", "last_viewed_at")
    VALUES ${rows}
    ON CONFLICT ("chain_id", "address") DO UPDATE SET
      "denom" = EXCLUDED."denom",
      "last_viewed_at" = GREATEST("account_balances"."last_viewed_at", EXCLUDED."last_viewed_at")
  `;
  return validVisits.length;
};

const drainAccountVisits = async (redis: AccountBalanceRedis, context: JobAccountBalanceContext): Promise<void> => {
  const snapshot = await readAccountVisitSnapshot(redis, context.chainName);
  if (snapshot.length === 0) return;

  const persisted = await upsertAccountVisits(context, snapshot);
  const removed = await removeUnchangedAccountVisits(redis, context.chainName, snapshot);
  logInfo(`${context.chainName}: persisted ${persisted} account visits and removed ${removed} buffered entries`);
};

const refreshCandidate = async (
  context: JobAccountBalanceContext,
  candidate: { id: number; address: string },
  now: () => Date,
): Promise<RefreshedAccountBalance | null> => {
  const address = normalizeBech32Address(candidate.address, context.bech32Prefix);
  if (!address || address !== candidate.address) {
    logError(`${context.chainName}: refusing to refresh invalid stored account ${candidate.address}`);
    return null;
  }

  try {
    const parts = await fetchCosmosAccountBalanceParts(address, context.minimalDenom, context.loadJson);
    return { id: candidate.id, parts, refreshedAt: now() };
  } catch (error) {
    logError(`${context.chainName}: failed to refresh account ${address}`, error);
    return null;
  }
};

const refreshAccountBalanceCandidates = async (context: JobAccountBalanceContext, now: () => Date): Promise<void> => {
  const referenceTime = now();
  const where: Prisma.AccountBalanceWhereInput = {
    chainId: context.chainId,
    lastViewedAt: { gte: new Date(referenceTime.getTime() - ACTIVE_WINDOW_MS) },
    OR: [{ updatedAt: null }, { updatedAt: { lte: new Date(referenceTime.getTime() - REFRESH_INTERVAL_MS) } }],
  };
  const [backlog, candidates] = await Promise.all([
    db.accountBalance.count({ where }),
    db.accountBalance.findMany({
      where,
      select: { id: true, address: true },
      orderBy: [{ updatedAt: { sort: 'asc', nulls: 'first' } }, { lastViewedAt: 'desc' }],
      take: REFRESH_BATCH,
    }),
  ]);

  if (backlog > BACKLOG_WARNING_THRESHOLD) {
    logWarn(`${context.chainName}: account balance refresh backlog is ${backlog} rows`);
  }

  let refreshed = 0;
  for (let offset = 0; offset < candidates.length; offset += REFRESH_CONCURRENCY) {
    const chunk = candidates.slice(offset, offset + REFRESH_CONCURRENCY);
    const results = await Promise.all(chunk.map((candidate) => refreshCandidate(context, candidate, now)));
    const updates = results.filter((result): result is RefreshedAccountBalance => result !== null);
    if (updates.length === 0) continue;

    await db.$transaction(
      updates.map((update) =>
        db.accountBalance.update({
          where: { id: update.id },
          data: { ...update.parts, denom: context.minimalDenom, updatedAt: update.refreshedAt },
        }),
      ),
    );
    refreshed += updates.length;
  }

  logInfo(`${context.chainName}: refreshed ${refreshed} of ${candidates.length} selected account balances`);
};

const pruneAccountBalances = async (context: JobAccountBalanceContext, now: () => Date): Promise<void> => {
  const expired = await db.accountBalance.findMany({
    where: {
      chainId: context.chainId,
      lastViewedAt: { lt: new Date(now().getTime() - RETENTION_WINDOW_MS) },
    },
    select: { id: true },
    orderBy: { lastViewedAt: 'asc' },
    take: CLEANUP_BATCH,
  });
  if (expired.length === 0) return;

  const result = await db.accountBalance.deleteMany({ where: { id: { in: expired.map((row) => row.id) } } });
  logInfo(`${context.chainName}: pruned ${result.count} inactive account balances`);
};

const processChain = async (
  chainName: string,
  redis: AccountBalanceRedis,
  options: AccountBalanceJobOptions,
): Promise<void> => {
  const context = await createJobAccountBalanceContext(chainName, options.loadJsonOverride);
  if (!context) {
    logWarn(`${chainName}: database chain parameters are missing, skipping account balances`);
    return;
  }
  const now = options.now ?? (() => new Date());

  try {
    await drainAccountVisits(redis, context);
  } catch (error) {
    logError(`${chainName}: account visit drain failed; buffered visits were retained`, error);
  }
  await refreshAccountBalanceCandidates(context, now);
  await pruneAccountBalances(context, now);
};

const updateAccountBalances = async (options: AccountBalanceJobOptions = {}): Promise<void> => {
  const redis = options.redis ?? createRedisClient();
  const ownsRedis = !options.redis;
  logInfo('Starting account balance refresh');

  try {
    for (const chainName of ACCOUNT_BALANCE_CHAIN_NAMES) {
      try {
        await processChain(chainName, redis, options);
      } catch (error) {
        logError(`${chainName}: account balance processing failed`, error);
      }
    }
  } finally {
    if (ownsRedis) redis.disconnect();
  }

  logInfo('Account balance refresh completed');
};

export default updateAccountBalances;
