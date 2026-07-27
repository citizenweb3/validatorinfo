'use server';

import logger from '@/logger';
import TransferFeedService, {
  type TransferCursor,
  type TransferFeedItem,
  isTransferFeedChainSupported,
} from '@/services/transfer-feed-service';

const { logError } = logger('get-transfers-batch');

const BECH32 = /^[a-z]+1[02-9ac-hj-np-z]{6,}$/;
const TX_HASH = /^[A-Fa-f0-9]{64}$/;
const DENOM = /^[a-zA-Z][a-zA-Z0-9/:._-]{1,127}$/;
const HEIGHT = /^\d{1,20}$/;

export type TransferBatchResult =
  | { ok: true; rows: TransferFeedItem[]; nextCursor: TransferCursor | null; hasMore: boolean }
  | { ok: false; code: 'INVALID_REQUEST' | 'SERVICE_ERROR' };

const isValidCursor = (cursor: TransferCursor): boolean =>
  HEIGHT.test(cursor.before_height) &&
  TX_HASH.test(cursor.before_tx_hash) &&
  Number.isInteger(cursor.before_msg_index) &&
  cursor.before_msg_index >= 0 &&
  BECH32.test(cursor.before_from) &&
  BECH32.test(cursor.before_to) &&
  DENOM.test(cursor.before_denom);

/**
 * Server action: fetch one transfer batch for the client feed on the account Tokens tab. Mirrors
 * the tx-batch action: unsupported chains short-circuit to an empty OK result, malformed input is
 * INVALID_REQUEST, and a thrown/error batch surfaces as SERVICE_ERROR for the Retry affordance.
 */
export const getTransfersBatch = async (
  address: string,
  chainName: string,
  cursor?: TransferCursor,
): Promise<TransferBatchResult> => {
  try {
    if (!isTransferFeedChainSupported(chainName)) {
      return { ok: true, rows: [], nextCursor: null, hasMore: false };
    }
    if (!BECH32.test(address)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }
    if (cursor && !isValidCursor(cursor)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }

    const batch = await TransferFeedService.getTransfersByAddressBatch(chainName, address, cursor);
    if (batch.error) {
      return { ok: false, code: 'SERVICE_ERROR' };
    }

    return { ok: true, rows: batch.rows, nextCursor: batch.nextCursor, hasMore: batch.hasMore };
  } catch (error) {
    logError(`getTransfersBatch failed: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, code: 'SERVICE_ERROR' };
  }
};
