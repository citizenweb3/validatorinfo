import { Chain, ChainHashrateSnapshot, ChainParams, MiningPool, MiningPoolStats } from '@prisma/client';

import db from '@/db';

export type HashrateWindow = '24h' | '7d' | '30d' | 'all';

// The window union, authoritative in one place; both the stats page and the network pools list
// validate a raw ?window param against this instead of re-declaring their own copy.
export const VALID_WINDOWS: HashrateWindow[] = ['24h', '7d', '30d', 'all'];

export const isValidWindow = (value: string | undefined): value is HashrateWindow =>
  value !== undefined && (VALID_WINDOWS as string[]).includes(value);

export type MoneroPoolStatsRow = MiningPoolStats & {
  pool: MiningPool;
};

const MONERO_NAME = 'monero';

const windowToCutoff = (window: HashrateWindow): Date | null => {
  const now = Date.now();
  if (window === '24h') return new Date(now - 24 * 60 * 60 * 1000);
  if (window === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (window === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
};

const getMoneroChain = async (): Promise<Chain | null> => {
  return db.chain.findUnique({ where: { name: MONERO_NAME } });
};

const getMoneroNetworkSnapshot = async (): Promise<ChainHashrateSnapshot | null> => {
  const chain = await getMoneroChain();
  if (!chain) return null;

  return db.chainHashrateSnapshot.findFirst({
    where: { chainId: chain.id },
    orderBy: { snapshotAt: 'desc' },
  });
};

const getMoneroHashrateHistory = async (window: HashrateWindow): Promise<ChainHashrateSnapshot[]> => {
  const chain = await getMoneroChain();
  if (!chain) return [];

  const cutoff = windowToCutoff(window);

  return db.chainHashrateSnapshot.findMany({
    where: {
      chainId: chain.id,
      ...(cutoff ? { snapshotAt: { gte: cutoff } } : {}),
    },
    orderBy: { snapshotAt: 'asc' },
  });
};

const getMoneroPoolStats = async (window: HashrateWindow): Promise<MoneroPoolStatsRow[]> => {
  const chain = await getMoneroChain();
  if (!chain) return [];

  return db.miningPoolStats.findMany({
    where: { chainId: chain.id, windowKind: window },
    include: { pool: true },
    orderBy: { sharePercent: 'desc' },
  });
};

// Returns RAW ATOMIC piconero (emission-only). The caller MUST divide by
// 10^coinDecimals (=12) at render — never pre-divide here (design §6).
const getMoneroSupply = async (): Promise<string | null> => {
  const chain = await db.chain.findUnique({
    where: { name: MONERO_NAME },
    include: { tokenomics: true },
  });

  if (!chain?.tokenomics?.totalSupply) return null;
  return chain.tokenomics.totalSupply;
};

const getMoneroChainParams = async (): Promise<ChainParams | null> => {
  const chain = await db.chain.findUnique({
    where: { name: MONERO_NAME },
    include: { params: true },
  });

  return chain?.params ?? null;
};

export interface MoneroHashratePoint {
  date: string;
  hashrate: number;
}

const getMoneroChartData = async (): Promise<MoneroHashratePoint[]> => {
  const chain = await getMoneroChain();
  if (!chain) return [];

  const snapshots = await db.chainHashrateSnapshot.findMany({
    where: { chainId: chain.id },
    orderBy: { snapshotAt: 'asc' },
    select: { snapshotAt: true, hashrate: true },
  });

  const byDay = new Map<string, { snapshotAt: Date; hashrate: number }>();
  for (const row of snapshots) {
    const day = row.snapshotAt.toISOString().slice(0, 10);
    let value: number;
    try {
      value = Number(BigInt(row.hashrate));
    } catch {
      value = Number(row.hashrate) || 0;
    }
    const existing = byDay.get(day);
    if (!existing || row.snapshotAt > existing.snapshotAt) {
      byDay.set(day, { snapshotAt: row.snapshotAt, hashrate: value });
    }
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { hashrate }]) => ({ date, hashrate }));
};

const getMoneroPoolsCount = async (): Promise<number> => {
  const chain = await getMoneroChain();
  if (!chain) return 0;

  return db.miningPool.count({ where: { chainId: chain.id } });
};

const getMoneroActivePoolsCount = async (window: HashrateWindow = '24h'): Promise<number> => {
  const chain = await getMoneroChain();
  if (!chain) return 0;

  // Exclude the synthetic "unknown" pool — "active pools" must count real pools only.
  const stats = await db.miningPoolStats.findMany({
    where: {
      chainId: chain.id,
      windowKind: window,
      blocksFound: { gt: 0 },
      pool: { slug: { not: 'unknown' } },
    },
    select: { poolId: true },
  });

  const unique = new Set(stats.map((s) => s.poolId));
  return unique.size;
};

export interface MoneroPoolBlock {
  height: number;
  blockHash: string;
  blockTimestamp: Date;
}

// A pool's recently-attributed canonical blocks (from MoneroBlockAttribution —
// replaces the dead coinbase-fingerprint lookup; design §5/§7).
const getMoneroPoolRecentBlocks = async (
  chainId: number,
  poolId: number,
  limit = 50,
  skip = 0,
  sortBy: 'height' | 'timestamp' = 'timestamp',
  order: 'asc' | 'desc' = 'desc',
): Promise<MoneroPoolBlock[]> => {
  const orderBy = sortBy === 'height' ? { height: order } : { blockTimestamp: order };

  return db.moneroBlockAttribution.findMany({
    where: { chainId, poolId, isCanonical: true, isConflicted: false },
    orderBy,
    skip,
    take: limit,
    select: { height: true, blockHash: true, blockTimestamp: true },
  });
};

// Total canonical blocks attributed to a pool — for paginating its Blocks tab.
const getMoneroPoolBlocksCount = async (chainId: number, poolId: number): Promise<number> => {
  return db.moneroBlockAttribution.count({
    where: { chainId, poolId, isCanonical: true, isConflicted: false },
  });
};

export interface BlockPoolInfo {
  slug: string;
  name: string;
  isVerified: boolean;
}

// blockHash -> attributed pool (slug/name/verified), for the blocks table's "Mined By" column. Only
// named, non-conflicted attributions resolve; everything else is "unknown". Verified pools have a
// profile page → the caller links them; unverified/unknown render as plain text.
const getPoolByBlockHashes = async (hashes: string[]): Promise<Map<string, BlockPoolInfo>> => {
  if (hashes.length === 0) return new Map();
  const chain = await getMoneroChain();
  if (!chain) return new Map();

  const rows = await db.moneroBlockAttribution.findMany({
    where: { chainId: chain.id, blockHash: { in: hashes }, isCanonical: true, isConflicted: false },
    select: { blockHash: true, pool: { select: { slug: true, name: true, isVerified: true } } },
  });

  const map = new Map<string, BlockPoolInfo>();
  for (const row of rows) {
    if (row.pool && row.pool.slug !== 'unknown') {
      map.set(row.blockHash, { slug: row.pool.slug, name: row.pool.name, isVerified: row.pool.isVerified });
    }
  }
  return map;
};

// Timestamp of the earliest attributed canonical block — how far back our pool coverage reaches.
// Used to only offer stats windows (24h/7d/30d/all) the attribution history actually covers.
const getMoneroAttributionStart = async (): Promise<Date | null> => {
  const chain = await getMoneroChain();
  if (!chain) return null;

  const row = await db.moneroBlockAttribution.findFirst({
    where: { chainId: chain.id, isCanonical: true, isConflicted: false },
    orderBy: { blockTimestamp: 'asc' },
    select: { blockTimestamp: true },
  });
  return row?.blockTimestamp ?? null;
};

// Windows the attribution history actually covers — single source of truth shared by the stats
// page and the network mining-pools list. Offering 30d/All before we have that much history would
// dilute a few days of data across a month-wide denominator (misleading, mostly "unknown").
const getMoneroAvailableWindows = async (): Promise<HashrateWindow[]> => {
  const attributionStart = await getMoneroAttributionStart();
  const spanMs = attributionStart ? Date.now() - attributionStart.getTime() : 0;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const windows: HashrateWindow[] = ['24h'];
  if (spanMs >= 7 * DAY_MS) windows.push('7d');
  if (spanMs >= 30 * DAY_MS) windows.push('30d');
  if (spanMs >= 7 * DAY_MS) windows.push('all');
  return windows;
};

const moneroService = {
  getMoneroChain,
  getMoneroAttributionStart,
  getMoneroAvailableWindows,
  getMoneroNetworkSnapshot,
  getMoneroHashrateHistory,
  getMoneroPoolStats,
  getMoneroSupply,
  getMoneroChainParams,
  getMoneroActivePoolsCount,
  getMoneroChartData,
  getMoneroPoolsCount,
  getMoneroPoolRecentBlocks,
  getMoneroPoolBlocksCount,
  getPoolByBlockHashes,
};

export default moneroService;

export {
  getMoneroChain,
  getMoneroAvailableWindows,
  getMoneroNetworkSnapshot,
  getMoneroHashrateHistory,
  getMoneroPoolStats,
  getMoneroSupply,
  getMoneroChainParams,
  getMoneroActivePoolsCount,
  getMoneroChartData,
  getMoneroPoolsCount,
  getMoneroPoolRecentBlocks,
  getMoneroPoolBlocksCount,
  getPoolByBlockHashes,
};
