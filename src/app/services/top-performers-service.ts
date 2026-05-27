import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

import db from '@/db';
import cutHash from '@/utils/cut-hash';
import { FDV_EXCLUDED_CHAINS } from '@/utils/fdv-excluded-chains';
import formatCash from '@/utils/format-cash';

// Top Performers & Highlights — one theme per UTC day, rotating through a fixed pool.
// Variant A: every theme is computable cross-chain from current data (no new indexer infra).

export interface HighlightRow {
  logoUrl: string | null;
  name: string;
  value: string;
  href: string;
}

export type HighlightThemeKey =
  | 'stakeTop'
  | 'delegatorsTop'
  | 'priceGainers'
  | 'aprTop'
  | 'fdvTop'
  | 'uptimeTop';

interface Theme {
  id: HighlightThemeKey;
  titleKey: HighlightThemeKey; // resolved against HomePage.highlights in the component
  fetch: () => Promise<HighlightRow[]>;
}

const ROW_LIMIT = 15;

const validatorHref = (validatorId: number | null, operatorAddress: string): string =>
  validatorId ? `/validators/${validatorId}/${operatorAddress}/validator_passport/authz/withdraw_rewards` : '';

const validatorName = (moniker: string, operatorAddress: string): string =>
  moniker && !moniker.startsWith('0x') ? moniker : cutHash({ value: operatorAddress, cutLength: 10 });

const networkHref = (name: string): string => `/networks/${name}/overview`;

// --- Network themes (one Tokenomics numeric column, ranked in DB) ---

type NetworkField = 'fdv' | 'apr' | 'changesPerDay';

const networkTheme = async (
  field: NetworkField,
  format: (value: number) => string,
  where: Prisma.ChainWhereInput,
): Promise<HighlightRow[]> => {
  const chains = await db.chain.findMany({
    where,
    orderBy: { tokenomics: { [field]: 'desc' } } as Prisma.ChainOrderByWithRelationInput,
    take: ROW_LIMIT,
    select: {
      name: true,
      prettyName: true,
      logoUrl: true,
      tokenomics: { select: { fdv: true, apr: true, changesPerDay: true } },
    },
  });

  return chains.map((chain) => ({
    logoUrl: chain.logoUrl,
    name: chain.prettyName,
    value: format(chain.tokenomics?.[field] ?? 0),
    href: networkHref(chain.name),
  }));
};

const fdvTop = (): Promise<HighlightRow[]> =>
  networkTheme('fdv', (value) => `$${formatCash(value)}`, {
    name: { notIn: FDV_EXCLUDED_CHAINS },
    tokenomics: { fdv: { gt: 0 } },
  });

const aprTop = (): Promise<HighlightRow[]> =>
  networkTheme('apr', (value) => `${(value * 100).toFixed(2)}%`, { tokenomics: { apr: { gt: 0 } } });

const priceGainers = (): Promise<HighlightRow[]> =>
  networkTheme('changesPerDay', (value) => `+${value.toFixed(2)}%`, { tokenomics: { changesPerDay: { gt: 0 } } });

// --- Validator themes (Node columns) ---

const delegatorsTop = async (): Promise<HighlightRow[]> => {
  const nodes = await db.node.findMany({
    where: { jailed: false, delegatorsAmount: { not: null } },
    orderBy: { delegatorsAmount: 'desc' },
    take: ROW_LIMIT,
    select: {
      moniker: true,
      operatorAddress: true,
      validatorId: true,
      delegatorsAmount: true,
      chain: { select: { logoUrl: true } },
    },
  });

  return nodes.map((node) => ({
    logoUrl: node.chain.logoUrl,
    name: validatorName(node.moniker, node.operatorAddress),
    value: (node.delegatorsAmount ?? 0).toLocaleString('en-US'),
    href: validatorHref(node.validatorId, node.operatorAddress),
  }));
};

const uptimeTop = async (): Promise<HighlightRow[]> => {
  const nodes = await db.node.findMany({
    where: { jailed: false, uptime: { not: null } },
    orderBy: { uptime: 'desc' },
    take: ROW_LIMIT,
    select: {
      moniker: true,
      operatorAddress: true,
      validatorId: true,
      uptime: true,
      chain: { select: { logoUrl: true } },
    },
  });

  return nodes.map((node) => ({
    logoUrl: node.chain.logoUrl,
    name: validatorName(node.moniker, node.operatorAddress),
    value: `${(node.uptime ?? 0).toFixed(2)}%`,
    href: validatorHref(node.validatorId, node.operatorAddress),
  }));
};

// Stake in USD is comparable across chains: tokens / 10^decimals * latestPrice.
// tokens is a string and price is per-chain, so the ranking is computed in JS. This scans
// all non-jailed nodes — getDailyHighlights is cached per 5 min so the scan is not per-request.
const stakeTop = async (): Promise<HighlightRow[]> => {
  // Newest price per chain: chainId must lead orderBy so `distinct` keeps the latest row.
  const prices = await db.price.findMany({
    distinct: ['chainId'],
    orderBy: [{ chainId: 'asc' }, { createdAt: 'desc' }],
    select: { chainId: true, value: true },
  });
  const priceByChain = new Map(prices.map((price) => [price.chainId, price.value]));

  const nodes = await db.node.findMany({
    where: { jailed: false },
    select: {
      moniker: true,
      operatorAddress: true,
      validatorId: true,
      tokens: true,
      chainId: true,
      chain: { select: { logoUrl: true, params: { select: { coinDecimals: true } } } },
    },
  });

  const ranked = nodes
    .map((node) => {
      const price = priceByChain.get(node.chainId);
      const decimals = node.chain.params?.coinDecimals;
      if (!price || price <= 0 || decimals == null) return null;

      const usd = (Number(node.tokens) / 10 ** decimals) * price;
      if (!Number.isFinite(usd) || usd <= 0) return null;

      return {
        usd,
        row: {
          logoUrl: node.chain.logoUrl,
          name: validatorName(node.moniker, node.operatorAddress),
          value: `$${formatCash(usd)}`,
          href: validatorHref(node.validatorId, node.operatorAddress),
        },
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.usd - a.usd)
    .slice(0, ROW_LIMIT);

  return ranked.map((entry) => entry.row);
};

const themes: Theme[] = [
  { id: 'stakeTop', titleKey: 'stakeTop', fetch: stakeTop },
  { id: 'delegatorsTop', titleKey: 'delegatorsTop', fetch: delegatorsTop },
  { id: 'priceGainers', titleKey: 'priceGainers', fetch: priceGainers },
  { id: 'aprTop', titleKey: 'aprTop', fetch: aprTop },
  { id: 'fdvTop', titleKey: 'fdvTop', fetch: fdvTop },
  { id: 'uptimeTop', titleKey: 'uptimeTop', fetch: uptimeTop },
];

// TODO(TEST): revert to 86_400_000 (1 day) and revalidate 300 after manual testing.
// Currently 60_000 (1 min) so the rotation is visible on reload.
const ROTATION_PERIOD_MS = 60_000;
const CACHE_REVALIDATE_SEC = 15;

// Deterministic per-period rotation. If the period's theme has no data, advance to the next
// non-empty one so the section is never empty. Cached briefly (caps the stakeTop full-table scan).
const getDailyHighlights = unstable_cache(
  async (): Promise<{ titleKey: HighlightThemeKey; rows: HighlightRow[] }> => {
    const periodIndex = Math.floor(Date.now() / ROTATION_PERIOD_MS);

    for (let offset = 0; offset < themes.length; offset++) {
      const theme = themes[(periodIndex + offset) % themes.length];
      const rows = await theme.fetch();
      if (rows.length > 0) {
        return { titleKey: theme.titleKey, rows };
      }
    }

    return { titleKey: themes[periodIndex % themes.length].titleKey, rows: [] };
  },
  ['top-performers-daily-highlights'],
  { revalidate: CACHE_REVALIDATE_SEC },
);

const topPerformersService = {
  getDailyHighlights,
};

export default topPerformersService;
