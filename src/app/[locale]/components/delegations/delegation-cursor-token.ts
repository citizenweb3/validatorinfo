import type { DelegationCursor, DelegationSort } from '@/services/delegation-service';

export const encodeDelegationCursorToken = (cursor: DelegationCursor, sort: DelegationSort): string => {
  const base = `${sort.sortBy}_${sort.order}_${cursor.before_height}_${cursor.before_index}_${cursor.before_msg_index}`;
  return sort.sortBy === 'amount' && cursor.before_amount !== undefined ? `${base}_${cursor.before_amount}` : base;
};

export const decodeDelegationCursorToken = (
  token: string | null | undefined,
  sort: DelegationSort,
): DelegationCursor | undefined => {
  if (!token) return undefined;

  const parts = token.split('_');
  if (parts.length !== (sort.sortBy === 'amount' ? 6 : 5)) return undefined;

  const [sortBy, order, beforeHeight, beforeIndexRaw, beforeMsgIndexRaw, beforeAmount] = parts;
  // The token carries the sort mode it was minted under. A mismatch means a stale ?c= survived a
  // sort-lever switch (TableSortItems preserves existing search params) — fall back to a head load.
  if (sortBy !== sort.sortBy || order !== sort.order) return undefined;

  if (!/^\d+$/.test(beforeHeight) || !/^\d+$/.test(beforeIndexRaw) || !/^-?\d+$/.test(beforeMsgIndexRaw)) {
    return undefined;
  }
  if (sort.sortBy === 'amount' && !/^\d{1,80}$/.test(beforeAmount)) return undefined;

  const beforeIndex = Number(beforeIndexRaw);
  const beforeMsgIndex = Number(beforeMsgIndexRaw);
  // msg_index domain is {-1} ∪ {>=0} (-1 = tx-level sentinel). Reject anything below -1 so a
  // malformed ?c= falls back to a head load instead of issuing a doomed cursor (matches the action gate).
  if (
    !Number.isInteger(beforeIndex) ||
    beforeIndex < 0 ||
    !Number.isInteger(beforeMsgIndex) ||
    beforeMsgIndex < -1
  ) {
    return undefined;
  }

  return {
    before_height: beforeHeight,
    before_index: beforeIndex,
    before_msg_index: beforeMsgIndex,
    ...(sort.sortBy === 'amount' ? { before_amount: beforeAmount } : {}),
  };
};
