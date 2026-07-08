import type { DelegationCursor } from '@/services/delegation-service';

export const encodeDelegationCursorToken = (cursor: DelegationCursor): string =>
  `${cursor.before_height}_${cursor.before_index}_${cursor.before_msg_index}`;

export const decodeDelegationCursorToken = (token?: string | null): DelegationCursor | undefined => {
  if (!token) return undefined;

  const parts = token.split('_');
  if (parts.length !== 3) return undefined;

  const [beforeHeight, beforeIndexRaw, beforeMsgIndexRaw] = parts;
  if (!/^\d+$/.test(beforeHeight) || !/^\d+$/.test(beforeIndexRaw) || !/^-?\d+$/.test(beforeMsgIndexRaw)) {
    return undefined;
  }

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
  };
};
