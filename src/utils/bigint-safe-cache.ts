import { unstable_cache } from 'next/cache';

// next/cache's unstable_cache serializes results with JSON.stringify, which throws on BigInt.
// Some Monero indexer DTOs carry bigint fields (e.g. block difficulty — exact, > 2^53), so we
// tag bigints as strings across the cache boundary and revive them on read. Precision preserved,
// the wrapper keeps the original function signature/return type.
const BIGINT_TAG = '__bigint__:';

const replacer = (_key: string, value: unknown): unknown =>
  typeof value === 'bigint' ? `${BIGINT_TAG}${value}` : value;

const reviver = (_key: string, value: unknown): unknown =>
  typeof value === 'string' && value.startsWith(BIGINT_TAG) ? BigInt(value.slice(BIGINT_TAG.length)) : value;

export const bigIntSafeCache = <A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  options: { revalidate: number },
): ((...args: A) => Promise<R>) => {
  const cached = unstable_cache(
    async (...args: A) => JSON.stringify(await fn(...args), replacer),
    keyParts,
    options,
  );

  return async (...args: A) => JSON.parse(await cached(...args), reviver) as R;
};
