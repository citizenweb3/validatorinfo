/**
 * Monero Indexer API client (single source of truth for VI — design §3.1/§4).
 *
 * Talks to the deployed indexer at `MONERO_INDEXER_BASE_URL` over `/api/v1/*`
 * with `Authorization: Bearer ${MONERO_INDEXER_API_TOKEN}`.
 *
 * Real contract (verified live):
 *   - list endpoints return `{ data: [...], pagination: { limit, offset, order, has_more } }`
 *   - fields are snake_case; `difficulty_hex` is a 0x-prefixed hex string > 2^53
 *   - pagination is `limit` + `offset` + `order` (asc|desc)
 *
 * VI does NOT consume `coinbase_extra_hex` (design decision 11) — it is mapped
 * through as an optional field but never used for attribution.
 *
 * Resilience: per-attempt timeout via AbortController, up to 3 attempts with
 * backoff. Retries on network errors and HTTP 5xx; 4xx is non-retryable.
 */

const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_SCHEDULE_MS = [250, 500, 1000] as const;

const baseUrl = (): string => {
  const base = process.env.MONERO_INDEXER_BASE_URL;
  if (!base) {
    throw new Error('MONERO_INDEXER_BASE_URL is not set');
  }
  return base.replace(/\/$/, '');
};

const authToken = (): string => process.env.MONERO_INDEXER_API_TOKEN ?? '';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableHttp = (status: number): boolean => status >= 500 && status < 600;

const isAbortError = (err: unknown): boolean =>
  err instanceof Error && (err.name === 'AbortError' || /aborted/i.test(err.message));

// Returns null on HTTP 404 (missing resource); throws on other non-2xx after retries.
const jsonGet = async <T>(path: string): Promise<T | null> => {
  let lastErr: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${baseUrl()}${path}`, {
        headers: { Authorization: `Bearer ${authToken()}` },
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        if (isRetryableHttp(res.status) && attempt < MAX_ATTEMPTS - 1) {
          lastErr = new Error(`Monero indexer HTTP ${res.status} ${res.statusText}`);
          await sleep(BACKOFF_SCHEDULE_MS[attempt]);
          continue;
        }
        throw new Error(`Monero indexer HTTP ${res.status} ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);

      if (err instanceof Error && /HTTP 4\d\d/.test(err.message)) {
        throw err;
      }
      lastErr = err;
      const retryable = isAbortError(err) || err instanceof TypeError;
      if (retryable && attempt < MAX_ATTEMPTS - 1) {
        await sleep(BACKOFF_SCHEDULE_MS[attempt]);
        continue;
      }
      if (!retryable) throw err;
    }
  }

  if (lastErr instanceof Error) throw lastErr;
  throw new Error(`Monero indexer request failed after ${MAX_ATTEMPTS} attempts: ${path}`);
};

// ---- Wire (snake_case) shapes ----

interface Pagination {
  limit: number;
  offset: number;
  order: 'asc' | 'desc';
  has_more: boolean;
}

interface Envelope<T> {
  data: T[];
  pagination: Pagination;
}

interface RawBlock {
  hash: string;
  prev_hash: string;
  height: number;
  timestamp: number;
  major_version: number;
  minor_version: number;
  nonce: number;
  block_size: number;
  block_weight: number;
  long_term_weight: number;
  num_txes: number;
  miner_tx_hash: string;
  reward_atomic: string;
  difficulty_hex: string;
  cumulative_difficulty_hex: string;
  coinbase_extra_hex: string | null;
  orphan_status: boolean;
  is_canonical: boolean;
  is_settled: boolean;
  indexed_at: string;
}

interface RawSupplyCheckpoint {
  height: number;
  block_hash: string;
  block_timestamp: number;
  cumulative_emission_atomic: string;
  cumulative_fee_atomic: string;
}

interface RawTransaction {
  hash: string;
  block_hash: string;
  block_height: number;
  position: number;
  version: number;
  unlock_time: string;
  is_coinbase: boolean;
  inputs_count: number;
  outputs_count: number;
  extra_size: number;
  fee_atomic: string;
  size: number;
  confirmations: number;
  in_pool: boolean;
  is_canonical: boolean;
  is_settled: boolean;
  indexed_at: string;
}

// The single-block endpoint (`/api/v1/blocks/{hash}`) is richer than the list
// rows: it embeds the block's full transactions array (+ a `raw` blob VI ignores).
interface RawBlockDetail extends RawBlock {
  transactions: RawTransaction[];
}

// ---- Public (camelCase) DTOs ----

export interface MoneroBlock {
  hash: string;
  prevHash: string;
  height: number;
  timestamp: number; // on-chain unix seconds
  majorVersion: number;
  minorVersion: number;
  nonce: number;
  size: number;
  weight: number;
  longTermWeight: number;
  txCount: number;
  minerTxHash: string;
  reward: string; // atomic (piconero)
  difficulty: bigint | null; // from difficulty_hex; null if missing/malformed → caller skips (no bogus 0)
  cumulativeDifficulty: bigint | null;
  isCanonical: boolean;
  isSettled: boolean;
  orphanStatus: boolean;
  indexedAt: string;
  /** Present but NOT consumed by VI (decision 11). */
  coinbaseExtraHex: string | null;
}

export interface MoneroSupplyCheckpoint {
  height: number;
  blockHash: string;
  blockTimestamp: number;
  /** Base block emission — this IS circulating supply (design §6). */
  cumulativeEmissionAtomic: string;
  /** Analytics only — NEVER summed into supply (design §6). */
  cumulativeFeeAtomic: string;
}

export interface MoneroTransaction {
  hash: string;
  blockHash: string;
  blockHeight: number;
  position: number;
  version: number;
  unlockTime: string;
  isCoinbase: boolean;
  inputsCount: number;
  outputsCount: number;
  extraSize: number;
  /** atomic (piconero). Amounts are hidden by RingCT — only the fee is public. */
  fee: string;
  size: number;
  confirmations: number;
  inPool: boolean;
  isCanonical: boolean;
  isSettled: boolean;
  indexedAt: string;
}

export interface MoneroBlockDetail extends MoneroBlock {
  /** The block's transactions (coinbase + regular), from the single-block endpoint. */
  transactions: MoneroTransaction[];
}

export interface MoneroListResult<T> {
  items: T[];
  hasMore: boolean;
  nextOffset: number;
}

export interface ListOpts {
  limit: number;
  offset?: number;
  order?: 'asc' | 'desc';
}

/**
 * Parse `difficulty_hex` with BigInt — never Number (cumulative difficulty
 * exceeds 2^53; per-block is future-proofed). Returns `null` for missing/empty/
 * malformed input so the caller can SKIP rather than persist a bogus `0`
 * (design §4.1 / Codex F1) — invalid difficulty must be distinguishable from a
 * genuine value.
 */
export const parseDifficultyHex = (hex: string | null | undefined): bigint | null => {
  if (typeof hex !== 'string' || hex.length === 0) return null;
  const normalized = hex.startsWith('0x') || hex.startsWith('0X') ? hex : `0x${hex}`;
  try {
    return BigInt(normalized);
  } catch {
    return null;
  }
};

export const toBlock = (r: RawBlock): MoneroBlock => ({
  hash: r.hash,
  prevHash: r.prev_hash,
  height: Number(r.height),
  timestamp: Number(r.timestamp),
  majorVersion: Number(r.major_version),
  minorVersion: Number(r.minor_version),
  nonce: Number(r.nonce),
  size: Number(r.block_size),
  weight: Number(r.block_weight),
  longTermWeight: Number(r.long_term_weight),
  txCount: Number(r.num_txes),
  minerTxHash: r.miner_tx_hash,
  reward: String(r.reward_atomic ?? '0'),
  difficulty: parseDifficultyHex(r.difficulty_hex),
  cumulativeDifficulty: parseDifficultyHex(r.cumulative_difficulty_hex),
  isCanonical: Boolean(r.is_canonical),
  isSettled: Boolean(r.is_settled),
  orphanStatus: Boolean(r.orphan_status),
  indexedAt: String(r.indexed_at ?? ''),
  coinbaseExtraHex: r.coinbase_extra_hex ?? null,
});

export const toSupply = (r: RawSupplyCheckpoint): MoneroSupplyCheckpoint => ({
  height: Number(r.height),
  blockHash: r.block_hash,
  blockTimestamp: Number(r.block_timestamp),
  cumulativeEmissionAtomic: String(r.cumulative_emission_atomic ?? '0'),
  cumulativeFeeAtomic: String(r.cumulative_fee_atomic ?? '0'),
});

export const toTransaction = (r: RawTransaction): MoneroTransaction => ({
  hash: r.hash,
  blockHash: r.block_hash,
  blockHeight: Number(r.block_height),
  position: Number(r.position),
  version: Number(r.version),
  unlockTime: String(r.unlock_time ?? '0'),
  isCoinbase: Boolean(r.is_coinbase),
  inputsCount: Number(r.inputs_count),
  outputsCount: Number(r.outputs_count),
  extraSize: Number(r.extra_size),
  fee: String(r.fee_atomic ?? '0'),
  size: Number(r.size),
  confirmations: Number(r.confirmations),
  inPool: Boolean(r.in_pool),
  isCanonical: Boolean(r.is_canonical),
  isSettled: Boolean(r.is_settled),
  indexedAt: String(r.indexed_at ?? ''),
});

export const toBlockDetail = (r: RawBlockDetail): MoneroBlockDetail => ({
  ...toBlock(r),
  transactions: (r.transactions ?? []).map(toTransaction),
});

const buildQuery = (opts: ListOpts): string => {
  const qs = new URLSearchParams({ limit: String(opts.limit) });
  if (opts.offset !== undefined) qs.set('offset', String(opts.offset));
  if (opts.order !== undefined) qs.set('order', opts.order);
  return qs.toString();
};

const unwrap = <Raw, Out>(
  env: Envelope<Raw> | null,
  map: (r: Raw) => Out,
  opts: ListOpts,
): MoneroListResult<Out> => {
  const items = (env?.data ?? []).map(map);
  // Guard the nested pagination object too — a partial 200 (data but no
  // pagination) must fall back to opts defaults, not throw a TypeError.
  const pg = env?.pagination;
  const offset = pg?.offset ?? opts.offset ?? 0;
  const limit = pg?.limit ?? opts.limit;
  return {
    items,
    hasMore: pg?.has_more ?? false,
    nextOffset: offset + limit,
  };
};

// ---- Blocks ----

export const listMoneroBlocks = async (opts: ListOpts): Promise<MoneroListResult<MoneroBlock>> => {
  const env = await jsonGet<Envelope<RawBlock>>(`/api/v1/blocks?${buildQuery(opts)}`);
  return unwrap(env, toBlock, opts);
};

export const getMoneroBlock = async (idOrHash: number | string): Promise<MoneroBlock | null> => {
  const raw = await jsonGet<RawBlock>(`/api/v1/blocks/${idOrHash}`);
  return raw ? toBlock(raw) : null;
};

// Single-block fetch INCLUDING the block's transactions (for the block detail page).
export const getMoneroBlockDetail = async (idOrHash: number | string): Promise<MoneroBlockDetail | null> => {
  const raw = await jsonGet<RawBlockDetail>(`/api/v1/blocks/${idOrHash}`);
  return raw ? toBlockDetail(raw) : null;
};

/**
 * Newest CANONICAL block (tip) — used for hashrate/difficulty (design §6).
 * Scans a small page and returns the first `isCanonical` block, enforcing the
 * canonical contract explicitly rather than trusting position (Codex F3).
 */
export const getTipBlock = async (): Promise<MoneroBlock | null> => {
  const { items } = await listMoneroBlocks({ limit: 5, order: 'desc' });
  return items.find((b) => b.isCanonical) ?? null;
};

// ---- Transactions ----

export const listMoneroTransactions = async (opts: ListOpts): Promise<MoneroListResult<MoneroTransaction>> => {
  const env = await jsonGet<Envelope<RawTransaction>>(`/api/v1/transactions?${buildQuery(opts)}`);
  return unwrap(env, toTransaction, opts);
};

export const getMoneroTransaction = async (hash: string): Promise<MoneroTransaction | null> => {
  const raw = await jsonGet<RawTransaction>(`/api/v1/transactions/${hash}`);
  return raw ? toTransaction(raw) : null;
};

// ---- Supply ----

export const listMoneroSupply = async (opts: ListOpts): Promise<MoneroListResult<MoneroSupplyCheckpoint>> => {
  const env = await jsonGet<Envelope<RawSupplyCheckpoint>>(`/api/v1/supply?${buildQuery(opts)}`);
  return unwrap(env, toSupply, opts);
};

/** Latest supply checkpoint (highest height) — used for total supply (design §6). */
export const getLatestSupply = async (): Promise<MoneroSupplyCheckpoint | null> => {
  const { items } = await listMoneroSupply({ limit: 1, order: 'desc' });
  return items[0] ?? null;
};

// ---- Health (sanity guard, design §6) ----

interface RawHealth {
  status?: string;
  last_height?: number | null;
  node_height?: number | null;
  lag_blocks?: number | null;
}

export interface MoneroHealth {
  status: string;
  lastHeight: number | null;
  nodeHeight: number | null;
  lagBlocks: number | null;
}

/**
 * GET /health — note: at the host root, NOT under /api/v1. Returns 200 (ok) or
 * 503 (degraded), both carrying the JSON body, so we read the body regardless
 * of status instead of routing through jsonGet (which would throw on 503).
 * Returns null on network failure (caller proceeds without the guard).
 */
export const getHealth = async (): Promise<MoneroHealth | null> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl()}/health`, {
      headers: { Authorization: `Bearer ${authToken()}` },
      signal: ctrl.signal,
    });
    const r = (await res.json()) as RawHealth;
    return {
      status: String(r.status ?? ''),
      lastHeight: r.last_height ?? null,
      nodeHeight: r.node_height ?? null,
      lagBlocks: r.lag_blocks ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};
