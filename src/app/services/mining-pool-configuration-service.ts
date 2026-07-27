import 'server-only';

import { type PoolConfiguration, getPoolRegistry } from '@/server/tools/chains/monero/pool-client';

const getBySlug = (poolSlug: string): PoolConfiguration | null => {
  const normalizedSlug = poolSlug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  return getPoolRegistry().find((pool) => pool.key === normalizedSlug)?.configuration ?? null;
};

const miningPoolConfigurationService = { getBySlug };

export default miningPoolConfigurationService;
export { getBySlug };
export type { PoolConfiguration };
