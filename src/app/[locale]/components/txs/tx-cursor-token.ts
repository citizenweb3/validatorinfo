import type { Cursor } from '@/services/tx-service';

// Compact, isomorphic cursor token for the URL: `${before_height}-${before_index}` (e.g. "31577956-5").
// Both fields are non-negative integers, so the single `-` separator is unambiguous. Used by the SSR
// wrapper (decode from searchParams) and the client widget (encode into history.pushState URLs).

export const encodeCursorToken = (cursor: Cursor): string =>
  `${cursor.before_height}-${cursor.before_index}`;

export const decodeCursorToken = (token: string | undefined | null): Cursor | undefined => {
  if (!token) return undefined;
  const sep = token.lastIndexOf('-');
  if (sep <= 0) return undefined;
  const before_height = token.slice(0, sep);
  const before_index = Number(token.slice(sep + 1));
  if (!/^\d+$/.test(before_height) || !Number.isInteger(before_index) || before_index < 0) {
    return undefined;
  }
  return { before_height, before_index };
};
