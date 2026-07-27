import type { TransferCursor } from '@/services/transfer-feed-service';

// URL token for the six-field transfer cursor. '~' never appears in heights, tx hashes,
// bech32 addresses, or denoms (denom charset is [a-zA-Z0-9/:._-]), so a plain join is safe.
const SEPARATOR = '~';

export const encodeTransferCursorToken = (cursor: TransferCursor): string =>
  [
    cursor.before_height,
    cursor.before_tx_hash,
    String(cursor.before_msg_index),
    cursor.before_from,
    cursor.before_to,
    cursor.before_denom,
  ].join(SEPARATOR);

export const decodeTransferCursorToken = (token: string): TransferCursor | null => {
  const parts = token.split(SEPARATOR);
  if (parts.length !== 6) return null;
  const [height, txHash, msgIndex, from, to, denom] = parts;
  if (!/^\d{1,20}$/.test(height)) return null;
  if (!/^[A-Fa-f0-9]{64}$/.test(txHash)) return null;
  if (!/^\d{1,9}$/.test(msgIndex)) return null;
  if (!/^[a-z0-9]{8,128}$/.test(from) || !/^[a-z0-9]{8,128}$/.test(to)) return null;
  if (!/^[a-zA-Z][a-zA-Z0-9/:._-]{1,127}$/.test(denom)) return null;
  return {
    before_height: height,
    before_tx_hash: txHash.toUpperCase(),
    before_msg_index: Number(msgIndex),
    before_from: from,
    before_to: to,
    before_denom: denom,
  };
};
