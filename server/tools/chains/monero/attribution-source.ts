/**
 * Single source of truth for Monero pool-attribution provenance values
 * (design §5.1). Used by both the attribution upsert and the MiningPool seed —
 * never free-form strings, to prevent silent mis-bucketing typos.
 */

/**
 * Where a block→pool attribution came from. Stored in `MoneroBlockAttribution.source`.
 * `coinbase_selfid` / `coinbase_url_auto` = narrow exact-string self-ID path (curated vanity tag / pool
 * URL embedded in coinbase), distinct from the removed heuristic fingerprint.
 */
export const ATTRIBUTION_SOURCES = ['pool_api', 'p2pool_observer', 'coinbase_selfid', 'coinbase_url_auto'] as const;
export type AttributionSource = (typeof ATTRIBUTION_SOURCES)[number];

/** How a `MiningPool` row was identified. Stored in `MiningPool.identificationMethod`. */
export const IDENTIFICATION_METHODS = [
  'pool_api',
  'p2pool_observer',
  'unknown',
  'coinbase_selfid',
  'coinbase_url_auto',
] as const;
export type IdentificationMethod = (typeof IDENTIFICATION_METHODS)[number];

/** Reserved slug for the "Unidentified / Solo" bucket (design §5.3). */
export const UNKNOWN_POOL_SLUG = 'unknown';
export const UNKNOWN_POOL_NAME = 'Unidentified / Solo';
