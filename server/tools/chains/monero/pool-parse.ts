/**
 * Pure parsers for pool-API "found blocks" responses (design §3.2/§3.3).
 * No framework / alias deps — unit-testable standalone (see __fixtures__/dto.check.ts).
 */

export interface PoolFoundBlock {
  height: number;
  hash: string;
  /** Pool-reported discovery time (unix seconds). Provenance only — window
   *  membership uses the indexer's canonical block timestamp (design §5.2). */
  timestamp: number;
}

// Pool APIs report timestamps in seconds OR milliseconds — normalize to seconds.
export const normalizeTs = (raw: unknown): number => {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n);
};

const toFoundBlock = (height: unknown, hash: unknown, ts: unknown): PoolFoundBlock | null => {
  const h = typeof height === 'number' ? height : Number(height);
  const hsh = typeof hash === 'string' ? hash : '';
  if (!Number.isFinite(h) || h <= 0 || !hsh) return null;
  return { height: h, hash: hsh, timestamp: normalizeTs(ts) };
};

// cryptonote-nodejs-pool family: array of objects (or { blocks: [...] } / { data: [...] }).
// Verified object shapes (supportxmr/moneroocean/hashvault): { height, hash, ts(ms), ... }.
export const parseCryptonoteBlocks = (body: unknown): PoolFoundBlock[] => {
  const raw = Array.isArray(body)
    ? body
    : Array.isArray((body as { blocks?: unknown[] } | null)?.blocks)
      ? (body as { blocks: unknown[] }).blocks
      : Array.isArray((body as { data?: unknown[] } | null)?.data)
        ? (body as { data: unknown[] }).data
        : null;
  if (!raw) {
    throw new Error('unexpected pool-blocks shape (expected array or { blocks: [] } / { data: [] })');
  }
  const out: PoolFoundBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const fb = toFoundBlock(o.height, o.hash, o.ts ?? o.timestamp ?? o.time);
    if (fb) out.push(fb);
  }
  // No silent truncation (design §3.2): a non-empty response that yields zero
  // parsed blocks is an unknown shape — throw so the caller logs + isolates.
  if (raw.length > 0 && out.length === 0) {
    throw new Error(`pool-blocks: ${raw.length} items but none parseable (unknown shape — needs a custom adapter)`);
  }
  return out;
};

// cryptonote-nodejs-pool `/api/get_blocks` FLAT shape (e.g. HeroMiners): a single array that alternates
// [blockString, height, blockString, height, ...]. Each blockString is colon-joined
// `hash:timestamp:difficulty:...:scheme`; the height is the bare number that follows it.
export const parseCryptonoteFlatBlocks = (body: unknown): PoolFoundBlock[] => {
  const raw = Array.isArray(body)
    ? body
    : Array.isArray((body as { blocks?: unknown[] } | null)?.blocks)
      ? (body as { blocks: unknown[] }).blocks
      : null;
  if (!raw) {
    throw new Error('unexpected flat cryptonote shape (expected array or { blocks: [] })');
  }
  const out: PoolFoundBlock[] = [];
  for (let i = 0; i + 1 < raw.length; i += 2) {
    const blockStr = raw[i];
    const height = raw[i + 1];
    if (typeof blockStr !== 'string') continue;
    const parts = blockStr.split(':');
    const hash = parts[0];
    if (!/^[0-9a-f]{64}$/i.test(hash)) continue;
    const fb = toFoundBlock(height, hash, parts[1]);
    if (fb) out.push(fb);
  }
  if (raw.length > 0 && out.length === 0) {
    throw new Error(`flat cryptonote: ${raw.length} items but none parseable (unknown shape)`);
  }
  return out;
};

// p2pool.observer /api/found_blocks: array of { main_block: { id, height, timestamp } }.
export const parseObserverBlocks = (body: unknown): PoolFoundBlock[] => {
  if (!Array.isArray(body)) {
    throw new Error('unexpected p2pool.observer shape (expected array)');
  }
  const out: PoolFoundBlock[] = [];
  for (const item of body) {
    const mb = (item as { main_block?: Record<string, unknown> } | null)?.main_block;
    if (!mb) continue;
    const fb = toFoundBlock(mb.height, mb.id, mb.timestamp);
    if (fb) out.push(fb);
  }
  if (body.length > 0 && out.length === 0) {
    throw new Error(`p2pool.observer: ${body.length} items but none parseable (unknown shape)`);
  }
  return out;
};

// nanopool: { status, data: [{ block_number, hash, date(unix seconds), ... }] }.
export const parseNanopoolBlocks = (body: unknown): PoolFoundBlock[] => {
  const data = (body as { data?: unknown[] } | null)?.data;
  if (!Array.isArray(data)) {
    throw new Error('unexpected nanopool shape (expected { data: [] })');
  }
  const out: PoolFoundBlock[] = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const fb = toFoundBlock(o.block_number, o.hash, o.date);
    if (fb) out.push(fb);
  }
  if (data.length > 0 && out.length === 0) {
    throw new Error(`nanopool: ${data.length} items but none parseable`);
  }
  return out;
};
