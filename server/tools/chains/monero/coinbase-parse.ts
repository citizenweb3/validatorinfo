/**
 * Pure helpers for the coinbase self-ID attribution path.
 *
 * Most Monero blocks carry no identifying string in coinbase `tx_extra` (verified empirically),
 * but a rare few self-identify — a solo-miner vanity tag (e.g. `/Heathcliff/`) or a pool URL
 * (e.g. `https://xmr.tokyo/`). This is a NARROW, exact-string allowlist match against canonical
 * blocks — NOT the heuristic family-fingerprint that was proven non-viable and removed.
 */

// Decode coinbase_extra hex into printable-ASCII runs of >= minLen chars.
export const extractAsciiRuns = (hex: string | null | undefined, minLen = 5): string[] => {
  if (!hex) return [];
  let buf: Buffer;
  try {
    buf = Buffer.from(hex.replace(/^0x/, ''), 'hex');
  } catch {
    return [];
  }
  const runs: string[] = [];
  let run = '';
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    if (byte >= 0x20 && byte <= 0x7e) {
      run += String.fromCharCode(byte);
    } else {
      if (run.length >= minLen) runs.push(run);
      run = '';
    }
  }
  if (run.length >= minLen) runs.push(run);
  return runs;
};

// Normalize a URL for stable comparison/storage (lowercase host, single trailing slash, no query).
export const normalizeUrl = (raw: string): string | null => {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const host = u.host.toLowerCase();
    const pathPart = u.pathname.replace(/\/+$/, '');
    return `${u.protocol}//${host}${pathPart}/`;
  } catch {
    return null;
  }
};

// Extract distinct normalized http(s) URLs embedded in the ASCII runs.
export const extractUrls = (runs: string[]): string[] => {
  const out = new Set<string>();
  for (const r of runs) {
    const m = r.match(/https?:\/\/[^\s'"<>]+/i);
    if (!m) continue;
    const norm = normalizeUrl(m[0]);
    if (norm) out.add(norm);
  }
  return Array.from(out);
};

// Derive a stable slug from a URL's host (xmr.tokyo → xmrtokyo).
export const slugFromUrl = (url: string): string => {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* fall through to raw */
  }
  return host
    .replace(/^www\./, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .slice(0, 60);
};

// A friendly display name from a URL's host (xmr.tokyo → xmr.tokyo).
export const nameFromUrl = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};
