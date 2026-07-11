import db from '@/db';
import logger from '@/logger';
import {
  UNKNOWN_POOL_NAME,
  UNKNOWN_POOL_SLUG,
} from '@/server/tools/chains/monero/attribution-source';

const { logInfo, logError, logWarn } = logger('monero-pool-daily-share');

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfUtcDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addUtcDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);

const dateKey = (date: Date): string => date.toISOString().slice(0, 10);

const updateMoneroPoolDailyShare = async (): Promise<void> => {
  logInfo('Starting Monero pool daily-share update');

  try {
    const chain = await db.chain.findUnique({ where: { name: 'monero' }, select: { id: true } });
    if (!chain) {
      logWarn('Chain "monero" not found, skipping');
      return;
    }

    const historyStartRow = await db.moneroBlock.findFirst({
      where: { chainId: chain.id, isCanonical: true },
      orderBy: { blockTimestamp: 'asc' },
      select: { blockTimestamp: true },
    });
    if (!historyStartRow) {
      logWarn('No canonical MoneroBlock history, skipping');
      return;
    }

    const today = startOfUtcDay(new Date());
    const yesterday = addUtcDays(today, -1);
    const historyStart = startOfUtcDay(historyStartRow.blockTimestamp);
    if (historyStart > yesterday) {
      logInfo('No completed UTC day in MoneroBlock history, skipping');
      return;
    }

    const lastStored = await db.moneroPoolDailyShare.findFirst({
      where: { chainId: chain.id },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    const candidateStart = lastStored ? addUtcDays(startOfUtcDay(lastStored.date), -1) : historyStart;
    const recomputeStart = new Date(
      Math.max(historyStart.getTime(), Math.min(candidateStart.getTime(), yesterday.getTime())),
    );

    const existingPools = await db.miningPool.findMany({
      where: { chainId: chain.id },
      select: { id: true, slug: true },
    });
    let unknownPool = existingPools.find((pool) => pool.slug === UNKNOWN_POOL_SLUG);
    if (!unknownPool) {
      unknownPool = await db.miningPool.upsert({
        where: { chainId_slug: { chainId: chain.id, slug: UNKNOWN_POOL_SLUG } },
        update: {},
        create: {
          chainId: chain.id,
          slug: UNKNOWN_POOL_SLUG,
          name: UNKNOWN_POOL_NAME,
          identificationMethod: 'unknown',
          isVerified: false,
        },
        select: { id: true, slug: true },
      });
    }
    const namedPools = existingPools.filter((pool) => pool.slug !== UNKNOWN_POOL_SLUG);

    for (let day = recomputeStart; day <= yesterday; day = addUtcDays(day, 1)) {
      const dayStart = new Date(day);
      const dayEnd = addUtcDays(dayStart, 1);

      try {
        const networkBlockRows = await db.moneroBlock.findMany({
          where: {
            chainId: chain.id,
            isCanonical: true,
            blockTimestamp: { gte: dayStart, lt: dayEnd },
          },
          select: { blockHash: true },
        });
        const networkBlocks = networkBlockRows.length;

        if (networkBlocks === 0) {
          logWarn(`${dateKey(dayStart)}: no canonical MoneroBlock rows, skipping day`);
          continue;
        }

        const attributed = await db.moneroBlockAttribution.findMany({
          where: {
            chainId: chain.id,
            poolId: { not: unknownPool.id },
            blockHash: { in: networkBlockRows.map((row) => row.blockHash) },
            isCanonical: true,
            isConflicted: false,
          },
          select: { poolId: true },
        });
        const blocksByPool = new Map<number, number>();
        for (const row of attributed) {
          blocksByPool.set(row.poolId, (blocksByPool.get(row.poolId) ?? 0) + 1);
        }
        const attributedBlocks = attributed.length;
        if (attributedBlocks > networkBlocks) {
          logWarn(
            `${dateKey(dayStart)}: attributed blocks (${attributedBlocks}) exceed network blocks (${networkBlocks}); unknown clamped to 0`,
          );
        }
        const unknownBlocks = Math.max(0, networkBlocks - attributedBlocks);
        const dailyRows = [
          ...namedPools.map((pool) => ({ poolId: pool.id, blocksFound: blocksByPool.get(pool.id) ?? 0 })),
          { poolId: unknownPool.id, blocksFound: unknownBlocks },
        ];

        await db.$transaction(
          dailyRows.map(({ poolId, blocksFound }) =>
            db.moneroPoolDailyShare.upsert({
              where: { chainId_poolId_date: { chainId: chain.id, poolId, date: dayStart } },
              update: {
                blocksFound,
                sharePercent: (blocksFound / networkBlocks) * 100,
                networkBlocks,
              },
              create: {
                chainId: chain.id,
                poolId,
                date: dayStart,
                blocksFound,
                sharePercent: (blocksFound / networkBlocks) * 100,
                networkBlocks,
              },
            }),
          ),
        );

        logInfo(
          `${dateKey(dayStart)}: network=${networkBlocks} attributed=${attributedBlocks} unknown=${unknownBlocks} pools=${dailyRows.length}`,
        );
      } catch (error) {
        logError(`${dateKey(dayStart)}: daily-share update failed`, error);
      }
    }

    logInfo('Monero pool daily-share update completed');
  } catch (error) {
    logError('Monero pool daily-share update failed', error);
  }
};

export default updateMoneroPoolDailyShare;
