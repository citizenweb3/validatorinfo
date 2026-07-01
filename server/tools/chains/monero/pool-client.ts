/**
 * Monero mining-pool API client (design §3.2/§3.3).
 *
 * Pools authoritatively list the blocks THEY found; VI cross-references those
 * against on-chain indexer blocks (by hash) to attribute share. Most pools run
 * a `cryptonote-nodejs-pool` fork (`/api/pool/blocks` → objects with
 * height/hash/ts); p2pool is decentralized and uses the `p2pool.observer` API.
 *
 * Pure response parsing lives in `pool-parse.ts` (unit-tested standalone). Every
 * call here is isolated — one pool's failure never breaks the others.
 */

import logger from '@/logger';
import { AttributionSource } from '@/server/tools/chains/monero/attribution-source';
import poolRegistry from '@/server/tools/chains/monero/pool-apis.json';
import {
  PoolFoundBlock,
  parseCryptonoteBlocks,
  parseCryptonoteFlatBlocks,
  parseNanopoolBlocks,
  parseObserverBlocks,
} from '@/server/tools/chains/monero/pool-parse';

export type { PoolFoundBlock };

const { logWarn } = logger('monero-pool-client');

const FETCH_TIMEOUT_MS = 12_000;

export interface PoolRegistryEntry {
  key: string;
  name: string;
  type: 'cryptonote' | 'cryptonote_flat' | 'p2pool_observer' | 'nanopool';
  website: string | null;
  logoUrl: string | null;
  paymentScheme: string | null;
  feePercent: number | null;
  github: string | null;
  twitter: string | null;
  blocksUrl: string;
  statsUrl: string | null;
}

export interface PoolLiveStats {
  hashRate: number | null;
  miners: number | null;
  totalBlocksFound: number | null;
}

export const getPoolRegistry = (): PoolRegistryEntry[] => poolRegistry as PoolRegistryEntry[];

export const sourceForPool = (pool: PoolRegistryEntry): AttributionSource =>
  pool.type === 'p2pool_observer' ? 'p2pool_observer' : 'pool_api';

const fetchJson = async (url: string): Promise<unknown> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'validatorinfo' }, signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

/** Fetch a pool's recently-found blocks. Throws on failure — caller isolates. */
export const fetchPoolBlocks = async (pool: PoolRegistryEntry): Promise<PoolFoundBlock[]> => {
  const body = await fetchJson(pool.blocksUrl);
  if (pool.type === 'p2pool_observer') return parseObserverBlocks(body);
  if (pool.type === 'nanopool') return parseNanopoolBlocks(body);
  if (pool.type === 'cryptonote_flat') return parseCryptonoteFlatBlocks(body);
  return parseCryptonoteBlocks(body);
};

const numFrom = (obj: Record<string, unknown> | undefined, ...keys: string[]): number | null => {
  if (!obj) return null;
  for (const k of keys) {
    const v = Number(obj[k]);
    if (Number.isFinite(v) && v > 0) return v;
  }
  return null;
};

/**
 * Best-effort live stats (supplementary, design §3.2 / Decision 3). Returns null
 * on any failure. Stats live in different places per pool software (Codex F3):
 *   - p2pool.observer /api/pool_info → `sidechain.{miners,found}`
 *   - HashVault → `pool_statistics.collective.{hashRate,miners,totalBlocksFound}`
 *   - SupportXMR/MoneroOcean → `pool_statistics.{...}`
 */
export const fetchPoolStats = async (pool: PoolRegistryEntry): Promise<PoolLiveStats | null> => {
  if (!pool.statsUrl) return null;
  try {
    const body = (await fetchJson(pool.statsUrl)) as Record<string, unknown>;

    if (pool.type === 'p2pool_observer') {
      const sc = body?.sidechain as Record<string, unknown> | undefined;
      return {
        hashRate: null, // not directly exposed by the observer pool_info endpoint
        miners: numFrom(sc, 'miners', 'workers'),
        totalBlocksFound: numFrom(sc, 'found', 'blocks_found'),
      };
    }

    const ps = (body?.pool_statistics ?? body?.pool ?? body) as Record<string, unknown> | undefined;
    const coll = (ps?.collective ?? ps) as Record<string, unknown> | undefined; // HashVault nests under `collective`
    return {
      hashRate: numFrom(coll, 'hashRate', 'hashrate', 'poolHashrate'),
      miners: numFrom(coll, 'miners', 'minerCount', 'workerCount'),
      totalBlocksFound: numFrom(coll, 'totalBlocksFound', 'totalBlocks'),
    };
  } catch (e) {
    logWarn(`pool=${pool.key} stats fetch failed: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
};
