import { SearchResult } from '@/api/search/route';
import db from '@/db';

const normalizeSearchValue = (value: string) =>
  value
    .toLowerCase()
    .replace(/[.\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const mergeUniqueIds = (groups: number[][]) => {
  const seen = new Set<number>();
  const orderedIds: number[] = [];

  for (const group of groups) {
    for (const id of group) {
      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      orderedIds.push(id);
    }
  }

  return orderedIds;
};

const rankRowsByIds = <T extends { id: number }>(rows: T[], rankedIds: number[]) => {
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  return rankedIds.map((id) => rowsById.get(id)).filter((row): row is T => Boolean(row));
};

const getValidatorIdsByNormalizedQuery = async (query: string, take: number): Promise<number[]> => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return [];
  }

  const rows = await db.$queryRaw<{ id: number }[]>`
    SELECT id
    FROM validators
    WHERE LOWER(REGEXP_REPLACE(moniker, '[._-]+', ' ', 'g')) LIKE '%' || ${normalizedQuery} || '%'
      OR LOWER(COALESCE(details, '')) LIKE '%' || ${normalizedQuery} || '%'
    ORDER BY moniker ASC
    LIMIT ${take}
  `;

  return rows.map((row) => row.id);
};

const getValidatorIdsByFuzzyQuery = async (query: string, take: number): Promise<number[]> => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return [];
  }

  const rows = await db.$queryRaw<{ id: number; score: number }[]>`
    SELECT
      id,
      GREATEST(
        similarity(LOWER(moniker), ${normalizedQuery}),
        similarity(LOWER(COALESCE(details, '')), ${normalizedQuery})
      ) AS score
    FROM validators
    WHERE GREATEST(
      similarity(LOWER(moniker), ${normalizedQuery}),
      similarity(LOWER(COALESCE(details, '')), ${normalizedQuery})
    ) >= 0.3
    ORDER BY score DESC, moniker ASC
    LIMIT ${take}
  `;

  return rows.map((row) => row.id);
};

const getChainIdsByNormalizedQuery = async (query: string, take: number): Promise<number[]> => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return [];
  }

  const rows = await db.$queryRaw<{ id: number }[]>`
    SELECT c.id
    FROM chains c
    LEFT JOIN chain_params cp ON cp.chain_id = c.id
    WHERE LOWER(REGEXP_REPLACE(c.name, '[._-]+', ' ', 'g')) LIKE '%' || ${normalizedQuery} || '%'
      OR LOWER(REGEXP_REPLACE(c.pretty_name, '[._-]+', ' ', 'g')) LIKE '%' || ${normalizedQuery} || '%'
      OR LOWER(COALESCE(cp.denom, '')) LIKE '%' || ${normalizedQuery} || '%'
    ORDER BY c.pretty_name ASC
    LIMIT ${take}
  `;

  return rows.map((row) => row.id);
};

const getChainIdsByFuzzyQuery = async (query: string, take: number): Promise<number[]> => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return [];
  }

  const rows = await db.$queryRaw<{ id: number; score: number }[]>`
    SELECT
      c.id,
      GREATEST(
        similarity(LOWER(c.name), ${normalizedQuery}),
        similarity(LOWER(c.pretty_name), ${normalizedQuery}),
        similarity(LOWER(COALESCE(cp.denom, '')), ${normalizedQuery})
      ) AS score
    FROM chains c
    LEFT JOIN chain_params cp ON cp.chain_id = c.id
    WHERE GREATEST(
      similarity(LOWER(c.name), ${normalizedQuery}),
      similarity(LOWER(c.pretty_name), ${normalizedQuery}),
      similarity(LOWER(COALESCE(cp.denom, '')), ${normalizedQuery})
    ) >= 0.3
    ORDER BY score DESC, c.pretty_name ASC
    LIMIT ${take}
  `;

  return rows.map((row) => row.id);
};

const getTokenChainIdsByNormalizedQuery = async (query: string, take: number): Promise<number[]> => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return [];
  }

  const rows = await db.$queryRaw<{ id: number }[]>`
    SELECT c.id
    FROM chains c
    INNER JOIN chain_params cp ON cp.chain_id = c.id
    WHERE LOWER(REGEXP_REPLACE(cp.denom, '[._-]+', ' ', 'g')) LIKE '%' || ${normalizedQuery} || '%'
    ORDER BY c.pretty_name ASC
    LIMIT ${take}
  `;

  return rows.map((row) => row.id);
};

const getTokenChainIdsByFuzzyQuery = async (query: string, take: number): Promise<number[]> => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return [];
  }

  const rows = await db.$queryRaw<{ id: number; score: number }[]>`
    SELECT
      c.id,
      similarity(LOWER(cp.denom), ${normalizedQuery}) AS score
    FROM chains c
    INNER JOIN chain_params cp ON cp.chain_id = c.id
    WHERE similarity(LOWER(cp.denom), ${normalizedQuery}) >= 0.3
    ORDER BY score DESC, c.pretty_name ASC
    LIMIT ${take}
  `;

  return rows.map((row) => row.id);
};

const searchValidators = async (query: string, take: number) => {
  const safeQuery = query.trim();
  if (!safeQuery) {
    return [];
  }

  const exact = await db.validator.findMany({
    where: {
      OR: [
        { moniker: { equals: safeQuery, mode: 'insensitive' } },
        { details: { equals: safeQuery, mode: 'insensitive' } },
      ],
    },
    take: Math.max(take, 1),
  });

  const exactIds = exact.map((validator) => validator.id);
  if (exactIds.length >= take) {
    return exact;
  }

  const contains = await db.validator.findMany({
    where: {
      OR: [
        { moniker: { contains: safeQuery, mode: 'insensitive' } },
        { details: { contains: safeQuery, mode: 'insensitive' } },
      ],
    },
    take: Math.max(take * 2, take),
  });

  const orderedIds = mergeUniqueIds([
    exactIds,
    contains.map((validator) => validator.id),
    await getValidatorIdsByNormalizedQuery(safeQuery, Math.max(take * 2, take)),
    await getValidatorIdsByFuzzyQuery(safeQuery, Math.max(take * 3, take)),
  ]).slice(0, take);

  if (orderedIds.length === 0) {
    return [];
  }

  const rows = await db.validator.findMany({
    where: { id: { in: orderedIds } },
  });

  return rankRowsByIds(rows, orderedIds);
};

const searchChains = async (query: string, take: number) => {
  const safeQuery = query.trim();
  if (!safeQuery) {
    return [];
  }

  const exact = await db.chain.findMany({
    where: {
      OR: [
        { name: { equals: safeQuery, mode: 'insensitive' } },
        { prettyName: { equals: safeQuery, mode: 'insensitive' } },
        { params: { denom: { equals: safeQuery, mode: 'insensitive' } } },
      ],
    },
    take: Math.max(take, 1),
  });

  const exactIds = exact.map((chain) => chain.id);
  if (exactIds.length >= take) {
    return exact;
  }

  const contains = await db.chain.findMany({
    where: {
      OR: [
        { name: { contains: safeQuery, mode: 'insensitive' } },
        { prettyName: { contains: safeQuery, mode: 'insensitive' } },
        { params: { denom: { contains: safeQuery, mode: 'insensitive' } } },
      ],
    },
    take: Math.max(take * 2, take),
  });

  const orderedIds = mergeUniqueIds([
    exactIds,
    contains.map((chain) => chain.id),
    await getChainIdsByNormalizedQuery(safeQuery, Math.max(take * 2, take)),
    await getChainIdsByFuzzyQuery(safeQuery, Math.max(take * 3, take)),
  ]).slice(0, take);

  if (orderedIds.length === 0) {
    return [];
  }

  const rows = await db.chain.findMany({
    where: { id: { in: orderedIds } },
  });

  return rankRowsByIds(rows, orderedIds);
};

const searchTokens = async (query: string, take: number) => {
  const safeQuery = query.trim();
  if (!safeQuery) {
    return [];
  }

  const exact = await db.chain.findMany({
    where: {
      params: {
        denom: { equals: safeQuery, mode: 'insensitive' },
      },
    },
    take: Math.max(take, 1),
    include: { params: true },
  });

  const exactIds = exact.map((chain) => chain.id);
  if (exactIds.length >= take) {
    return exact;
  }

  const contains = await db.chain.findMany({
    where: {
      params: {
        denom: { contains: safeQuery, mode: 'insensitive' },
      },
    },
    take: Math.max(take * 2, take),
    include: { params: true },
  });

  const orderedIds = mergeUniqueIds([
    exactIds,
    contains.map((chain) => chain.id),
    await getTokenChainIdsByNormalizedQuery(safeQuery, Math.max(take * 2, take)),
    await getTokenChainIdsByFuzzyQuery(safeQuery, Math.max(take * 3, take)),
  ]).slice(0, take);

  if (orderedIds.length === 0) {
    return [];
  }

  const rows = await db.chain.findMany({
    where: { id: { in: orderedIds } },
    include: { params: true },
  });

  return rankRowsByIds(rows, orderedIds);
};

const findAll = async (query: string): Promise<SearchResult> => {
  const [validators, chains, tokens] = await Promise.all([
    searchValidators(query, 10),
    searchChains(query, 10),
    searchTokens(query, 10),
  ]);

  return {
    validators,
    chains,
    tokens,
  };
};

const searchService = {
  findAll,
};

export default searchService;
