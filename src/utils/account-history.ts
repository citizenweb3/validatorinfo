const UNSIGNED_INTEGER_PATTERN = /^\d+$/;
const STAKING_DELTA_PAGE_SIZE = 100;
const MAX_STAKING_DELTA_PAGES = 1_000;
const MAX_STAKING_DELTA_ROWS = STAKING_DELTA_PAGE_SIZE * MAX_STAKING_DELTA_PAGES;
const MAX_REQUESTED_HEIGHTS = 500;

export type AccountCoverage = {
  earliest_height: string;
  earliest_time: string;
};

export type AccountEarliestActivity = {
  height: string;
  tx_index: number;
  tx_hash: string;
  time: string;
  source: 'actor' | 'transfer_out' | 'transfer_in';
};

export type AccountFirstSeen = {
  height: string;
  time: string;
  atOrBefore: boolean;
  source: 'genesis' | 'indexed';
};

export type AccountStakingDelta = {
  height: string;
  tx_index: number;
  msg_index: number;
  tx_hash: string;
  time: string;
  event_type: 'delegate' | 'redelegate' | 'unbond' | 'create_validator' | 'cancel_unbonding_delegation';
  validator_src: string | null;
  validator_dst: string | null;
  denom: string;
  amount: string;
  sign: 1 | -1 | 0;
  source: 'event' | 'message';
};

export type AccountStakingDeltasCursor = {
  next_before_height: string;
  next_before_index: number;
  next_before_msg_index: number;
};

export type AccountStakingDeltasPage = {
  data: AccountStakingDelta[];
  cursor: AccountStakingDeltasCursor | null;
  has_more: boolean;
  total: string;
  meta: { skipped_ambiguous_msgexec: string };
};

export type DrainedAccountStakingDeltas = {
  rows: AccountStakingDelta[];
  total: string;
  skippedAmbiguousMsgExec: string;
};

export type GenesisDelegatedStakeRow = {
  denom: string;
  amount: string;
};

export type DelegatedStakePoint = {
  height: string;
  amounts: Record<string, string>;
};

type StakingDeltasPageLoader = (cursor: AccountStakingDeltasCursor | null) => Promise<AccountStakingDeltasPage>;

const parseUnsignedInteger = (value: string, label: string): bigint => {
  if (!UNSIGNED_INTEGER_PATTERN.test(value)) throw new Error(`${label} must be an unsigned integer string`);
  return BigInt(value);
};

const parseDate = (value: string, label: string): number => {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error(`${label} must be an ISO timestamp`);
  return timestamp;
};

const validateFirstSeenCandidate = (candidate: AccountFirstSeen): void => {
  parseUnsignedInteger(candidate.height, 'first-seen height');
  parseDate(candidate.time, 'first-seen time');
};

export const selectFirstSeenCandidate = (
  genesis: AccountFirstSeen | null,
  indexed: AccountFirstSeen | null,
): AccountFirstSeen | null => {
  if (genesis) validateFirstSeenCandidate(genesis);
  if (indexed) validateFirstSeenCandidate(indexed);
  if (!genesis) return indexed;
  if (!indexed) return genesis;

  const genesisHeight = BigInt(genesis.height);
  const indexedHeight = BigInt(indexed.height);
  if (genesisHeight !== indexedHeight) return genesisHeight < indexedHeight ? genesis : indexed;

  const genesisTime = Date.parse(genesis.time);
  const indexedTime = Date.parse(indexed.time);
  if (genesisTime !== indexedTime) return genesisTime < indexedTime ? genesis : indexed;
  return genesis;
};

const validateCursor = (cursor: AccountStakingDeltasCursor): void => {
  parseUnsignedInteger(cursor.next_before_height, 'staking cursor height');
  if (!Number.isInteger(cursor.next_before_index) || cursor.next_before_index < 0) {
    throw new Error('staking cursor index must be a non-negative integer');
  }
  if (!Number.isInteger(cursor.next_before_msg_index) || cursor.next_before_msg_index < -1) {
    throw new Error('staking cursor message index must be an integer greater than or equal to -1');
  }
};

const cursorKey = (cursor: AccountStakingDeltasCursor): string =>
  `${cursor.next_before_height}:${cursor.next_before_index}:${cursor.next_before_msg_index}`;

export const drainAccountStakingDeltas = async (
  loadPage: StakingDeltasPageLoader,
): Promise<DrainedAccountStakingDeltas> => {
  const rows: AccountStakingDelta[] = [];
  const seenCursors = new Set<string>();
  let cursor: AccountStakingDeltasCursor | null = null;
  let maximumTotal = BigInt(0);
  let maximumSkipped = BigInt(0);

  for (let pageNumber = 0; pageNumber < MAX_STAKING_DELTA_PAGES; pageNumber++) {
    const page = await loadPage(cursor);
    if (page.data.length > STAKING_DELTA_PAGE_SIZE) {
      throw new Error(`staking deltas page exceeds ${STAKING_DELTA_PAGE_SIZE} rows`);
    }

    const total = parseUnsignedInteger(page.total, 'staking deltas total');
    const skipped = parseUnsignedInteger(page.meta.skipped_ambiguous_msgexec, 'skipped MsgExec count');
    if (total > BigInt(MAX_STAKING_DELTA_ROWS)) {
      throw new Error(`staking deltas total exceeds ${MAX_STAKING_DELTA_ROWS} rows`);
    }
    if (total > maximumTotal) maximumTotal = total;
    if (skipped > maximumSkipped) maximumSkipped = skipped;

    rows.push(...page.data);
    if (rows.length > MAX_STAKING_DELTA_ROWS) {
      throw new Error(`staking deltas response exceeds ${MAX_STAKING_DELTA_ROWS} rows`);
    }
    if (BigInt(rows.length) > maximumTotal) {
      throw new Error('staking deltas total is smaller than the drained row count');
    }
    if (!page.has_more) {
      return {
        rows,
        total: maximumTotal.toString(),
        skippedAmbiguousMsgExec: maximumSkipped.toString(),
      };
    }
    if (page.data.length === 0) throw new Error('staking deltas returned has_more with an empty page');
    if (!page.cursor) throw new Error('staking deltas returned has_more without a cursor');

    validateCursor(page.cursor);
    const lastRow = page.data.at(-1);
    if (
      !lastRow ||
      page.cursor.next_before_height !== lastRow.height ||
      page.cursor.next_before_index !== lastRow.tx_index ||
      page.cursor.next_before_msg_index !== lastRow.msg_index
    ) {
      throw new Error('staking deltas cursor does not match the final page row');
    }
    const key = cursorKey(page.cursor);
    if (seenCursors.has(key)) throw new Error('staking deltas pagination repeated its cursor');
    seenCursors.add(key);
    cursor = page.cursor;
  }

  throw new Error(`staking deltas pagination exceeds ${MAX_STAKING_DELTA_PAGES} pages`);
};

const snapshotAmounts = (amounts: ReadonlyMap<string, bigint>): Record<string, string> =>
  Object.fromEntries(
    Array.from(amounts.entries())
      .sort(([leftDenom], [rightDenom]) => leftDenom.localeCompare(rightDenom))
      .map(([denom, amount]) => [denom, amount.toString()]),
  );

const comparePreparedDeltas = (
  left: { row: AccountStakingDelta; height: bigint },
  right: { row: AccountStakingDelta; height: bigint },
): number => {
  if (left.height !== right.height) return left.height < right.height ? -1 : 1;
  if (left.row.tx_index !== right.row.tx_index) return left.row.tx_index - right.row.tx_index;
  if (left.row.msg_index !== right.row.msg_index) return left.row.msg_index - right.row.msg_index;
  return left.row.tx_hash.localeCompare(right.row.tx_hash);
};

export const composeDelegatedStakeSeries = (
  initialHeight: string,
  baselineRows: readonly GenesisDelegatedStakeRow[],
  deltas: readonly AccountStakingDelta[],
): DelegatedStakePoint[] => {
  const initialHeightValue = parseUnsignedInteger(initialHeight, 'genesis initial height');
  const amounts = new Map<string, bigint>();
  baselineRows.forEach((row, index) => {
    if (!row.denom) throw new Error(`genesis delegation ${index} denom must not be empty`);
    const amount = parseUnsignedInteger(row.amount, `genesis delegation ${index} amount`);
    amounts.set(row.denom, (amounts.get(row.denom) ?? BigInt(0)) + amount);
  });

  const preparedDeltas = deltas
    .map((row, index) => {
      if (!row.denom) throw new Error(`staking delta ${index} denom must not be empty`);
      if (!Number.isInteger(row.tx_index) || row.tx_index < 0) {
        throw new Error(`staking delta ${index} tx_index must be a non-negative integer`);
      }
      if (!Number.isInteger(row.msg_index) || row.msg_index < -1) {
        throw new Error(`staking delta ${index} msg_index must be an integer greater than or equal to -1`);
      }
      if (row.sign !== -1 && row.sign !== 0 && row.sign !== 1) {
        throw new Error(`staking delta ${index} sign is invalid`);
      }
      parseUnsignedInteger(row.amount, `staking delta ${index} amount`);
      const height = parseUnsignedInteger(row.height, `staking delta ${index} height`);
      if (height < initialHeightValue) throw new Error(`staking delta ${index} precedes genesis initial height`);
      return { row, height };
    })
    .sort(comparePreparedDeltas);

  const points: DelegatedStakePoint[] = [{ height: initialHeightValue.toString(), amounts: snapshotAmounts(amounts) }];
  let deltaIndex = 0;
  while (deltaIndex < preparedDeltas.length) {
    const height = preparedDeltas[deltaIndex].height;
    while (deltaIndex < preparedDeltas.length && preparedDeltas[deltaIndex].height === height) {
      const delta = preparedDeltas[deltaIndex].row;
      if (delta.sign !== 0) {
        const current = amounts.get(delta.denom) ?? BigInt(0);
        const amount = BigInt(delta.amount);
        const next = delta.sign === 1 ? current + amount : current - amount;
        amounts.set(delta.denom, next > BigInt(0) ? next : BigInt(0));
      }
      deltaIndex++;
    }

    const point = { height: height.toString(), amounts: snapshotAmounts(amounts) };
    if (height === initialHeightValue) points[0] = point;
    else points.push(point);
  }

  return points;
};

const findPointAtOrBefore = (
  preparedSeries: readonly { point: DelegatedStakePoint; height: bigint }[],
  height: bigint,
): DelegatedStakePoint | null => {
  let low = 0;
  let high = preparedSeries.length - 1;
  let match: DelegatedStakePoint | null = null;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = preparedSeries[middle];
    if (candidate.height <= height) {
      match = candidate.point;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return match;
};

export const selectDelegatedStakeAtHeights = (
  series: readonly DelegatedStakePoint[],
  heights: readonly string[],
): DelegatedStakePoint[] => {
  if (heights.length > MAX_REQUESTED_HEIGHTS) {
    throw new Error(`delegated stake query exceeds ${MAX_REQUESTED_HEIGHTS} requested heights`);
  }

  const preparedSeries = series.map((point, index) => ({
    point,
    height: parseUnsignedInteger(point.height, `delegated stake series point ${index} height`),
  }));
  preparedSeries.forEach((entry, index) => {
    if (index > 0 && entry.height <= preparedSeries[index - 1].height) {
      throw new Error('delegated stake series heights must be strictly increasing');
    }
  });

  return heights.map((height, index) => {
    const requestedHeight = parseUnsignedInteger(height, `requested height ${index}`);
    const point = findPointAtOrBefore(preparedSeries, requestedHeight);
    return { height: requestedHeight.toString(), amounts: point ? { ...point.amounts } : {} };
  });
};
