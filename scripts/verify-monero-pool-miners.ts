import {
  fetchPoolStats,
  getPoolRegistry,
} from '@/server/tools/chains/monero/pool-client';

const MINIMUM_SUCCESSFUL_POOLS = 4;
const REQUIRED_POOLS = ['supportxmr', 'hashvault'] as const;

const verifyMoneroPoolMiners = async (): Promise<void> => {
  const configuredPools = getPoolRegistry().filter((pool) => pool.statsUrl !== null);
  const results = await Promise.all(
    configuredPools.map(async (pool) => {
      const stats = await fetchPoolStats(pool);
      return { key: pool.key, miners: stats?.miners ?? null, hashRate: stats?.hashRate ?? null };
    }),
  );

  console.table(results);

  const successfulPools = results.filter((result) => result.miners !== null);
  const missingRequiredPools = REQUIRED_POOLS.filter(
    (requiredPool) => !successfulPools.some((result) => result.key === requiredPool),
  );

  if (successfulPools.length < MINIMUM_SUCCESSFUL_POOLS || missingRequiredPools.length > 0) {
    throw new Error(
      `Pool miners verification failed: successful=${successfulPools.length}, missingRequired=${missingRequiredPools.join(',') || 'none'}`,
    );
  }

  console.log(`Verified connected-miner counts for ${successfulPools.length}/${configuredPools.length} configured pools.`);
};

void verifyMoneroPoolMiners().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
