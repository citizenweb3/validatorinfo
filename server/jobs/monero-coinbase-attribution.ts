import fs from 'fs';
import path from 'path';

import db from '@/db';
import logger from '@/logger';
import {
  extractAsciiRuns,
  extractUrls,
  nameFromUrl,
  normalizeUrl,
  slugFromUrl,
} from '@/server/tools/chains/monero/coinbase-parse';
import { listMoneroBlocks } from '@/server/tools/chains/monero/indexer-client';

const { logInfo, logError, logWarn } = logger('monero-coinbase-attribution');

interface CoinbaseSeed {
  slug: string;
  name: string;
  tag: string;
  website: string | null;
  github: string | null;
  twitter: string | null;
  logoUrl: string | null;
}

const SCAN_BLOCKS = 5000;
const PAGE = 100;

// Auto-discovered pools live in their own slug namespace so an attacker-chosen coinbase URL can never
// produce a slug that collides with (and overwrites) a curated/API/verified pool record.
const AUTO_SLUG_PREFIX = 'cb_';

const loadSeed = (): CoinbaseSeed[] => {
  const file = path.join(process.cwd(), 'server', 'tools', 'chains', 'monero', 'coinbase-pools.json');
  return JSON.parse(fs.readFileSync(file, 'utf8')) as CoinbaseSeed[];
};

// Attribute the rare self-identifying blocks (solo-miner vanity tags + pool URLs in coinbase) that have
// no public API. Fills ONLY the "unknown" gap — never overrides pool-API attribution. Auto-discovers new
// http(s) pool URLs as unverified pools (promote to coinbase-pools.json manually once vetted).
const updateMoneroCoinbaseAttribution = async (): Promise<void> => {
  logInfo('Starting Monero coinbase self-ID attribution');

  const dbChain = await db.chain.findFirst({ where: { name: 'monero' } });
  if (!dbChain) {
    logWarn('Chain "monero" not found, skipping');
    return;
  }
  const chainId = dbChain.id;

  // 1. Upsert curated pools (verified) + build known-tag maps.
  const urlTagToSlug = new Map<string, string>(); // normalized URL → slug
  const stringTagToSlug = new Map<string, string>(); // literal vanity → slug

  for (const s of loadSeed()) {
    const fields = {
      name: s.name,
      website: s.website,
      github: s.github,
      twitter: s.twitter,
      logoUrl: s.logoUrl,
      identificationMethod: 'coinbase_selfid',
      fingerprint: s.tag,
      isVerified: true,
    };
    await db.miningPool.upsert({
      where: { chainId_slug: { chainId, slug: s.slug } },
      update: fields,
      create: { chainId, slug: s.slug, ...fields },
    });
    const norm = normalizeUrl(s.tag);
    if (norm) urlTagToSlug.set(norm, s.slug);
    else stringTagToSlug.set(s.tag, s.slug);
  }

  // Re-load previously auto-discovered coinbase pools (their URL tag lives in `fingerprint`).
  const autoPools = await db.miningPool.findMany({
    where: { chainId, identificationMethod: 'coinbase_url_auto', fingerprint: { not: null } },
    select: { slug: true, fingerprint: true },
  });
  for (const ap of autoPools) {
    const norm = ap.fingerprint ? normalizeUrl(ap.fingerprint) : null;
    if (norm) urlTagToSlug.set(norm, ap.slug);
  }

  // 2. Scan recent canonical blocks; match known tags + auto-discover new URLs.
  const matches: Array<{ height: number; hash: string; ts: number; slug: string; auto: boolean }> = [];
  const newAutoPools = new Map<string, { slug: string; url: string }>(); // normalized URL → meta
  let scanned = 0;

  for (let off = 0; off < SCAN_BLOCKS; off += PAGE) {
    let res;
    try {
      res = await listMoneroBlocks({ limit: PAGE, offset: off, order: 'desc' });
    } catch (e) {
      logError(`block fetch failed at offset ${off}: ${(e as Error).message}`);
      break;
    }
    if (!res.items.length) break;
    for (const b of res.items) {
      scanned++;
      if (!b.isCanonical) continue;
      const runs = extractAsciiRuns(b.coinbaseExtraHex);
      if (!runs.length) continue;

      // 2a. literal vanity tags (e.g. /Heathcliff/)
      let slug: string | null = null;
      for (const [tag, s] of Array.from(stringTagToSlug.entries())) {
        if (runs.some((r) => r.includes(tag))) {
          slug = s;
          break;
        }
      }
      let auto = false;

      // 2b. embedded URLs (known → that pool; new → auto-discover once)
      if (!slug) {
        for (const url of extractUrls(runs)) {
          const known = urlTagToSlug.get(url);
          if (known) {
            slug = known;
            break;
          }
          let meta = newAutoPools.get(url);
          if (!meta) {
            meta = { slug: `${AUTO_SLUG_PREFIX}${slugFromUrl(url)}`, url };
            newAutoPools.set(url, meta);
            urlTagToSlug.set(url, meta.slug);
          }
          slug = meta.slug;
          auto = true;
          break;
        }
      }

      if (slug) matches.push({ height: b.height, hash: b.hash, ts: b.timestamp, slug, auto });
    }
    if (!res.hasMore) break;
  }

  // 3. Persist newly-discovered auto pools (unverified — promote to JSON after vetting).
  // Defense in depth: never touch a pool we did not create (curated/API/verified) even if a slug collides.
  const protectedSlugs = new Set(
    (
      await db.miningPool.findMany({
        where: { chainId, identificationMethod: { not: 'coinbase_url_auto' } },
        select: { slug: true },
      })
    ).map((p) => p.slug),
  );

  for (const { slug, url } of Array.from(newAutoPools.values())) {
    if (protectedSlugs.has(slug)) {
      logWarn(`auto-pool slug '${slug}' collides with a curated/verified pool — skipping (${url})`);
      continue;
    }
    const fields = {
      name: nameFromUrl(url),
      website: url,
      github: null,
      twitter: null,
      logoUrl: null,
      identificationMethod: 'coinbase_url_auto',
      fingerprint: url,
      isVerified: false,
    };
    await db.miningPool.upsert({
      where: { chainId_slug: { chainId, slug } },
      update: fields,
      create: { chainId, slug, ...fields },
    });
    logInfo(`auto-discovered coinbase pool: ${slug} (${url})`);
  }

  // 4. Create attributions only where none exists yet (skipDuplicates keeps pool-API attribution authoritative).
  const slugToId = new Map(
    (await db.miningPool.findMany({ where: { chainId }, select: { id: true, slug: true } })).map((p) => [p.slug, p.id]),
  );

  const creates = matches
    .map((m) => {
      const poolId = slugToId.get(m.slug);
      if (poolId === undefined) return null;
      return {
        chainId,
        height: m.height,
        blockHash: m.hash,
        poolId,
        source: m.auto ? 'coinbase_url_auto' : 'coinbase_selfid',
        blockTimestamp: new Date(m.ts * 1000),
        poolReportedAt: null,
        isCanonical: true,
        isConflicted: false,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  let created = 0;
  if (creates.length) {
    const r = await db.moneroBlockAttribution.createMany({ data: creates, skipDuplicates: true });
    created = r.count;
  }

  logInfo(
    `coinbase self-ID done: scanned=${scanned}, matched=${matches.length}, new-attributions=${created}, auto-pools=${newAutoPools.size}`,
  );
};

export default updateMoneroCoinbaseAttribution;
