'use server';

import logger from '@/logger';
import TxService from '@/services/tx-service';
import type { Cursor, TxBatchResult } from '@/services/tx-service';

const { logError } = logger('get-txs-batch');

const COSMOSHUB = 'cosmoshub';

// Loose bech32 shape: <hrp>1<data>. Accepts both `cosmos1…` and `cosmosvaloper1…` (the validator
// feed sends both). The indexer validates strictly server-side; this is a cheap pre-filter so a
// malformed input fails fast as INVALID_REQUEST instead of hitting the indexer.
const BECH32 = /^[a-z]+1[02-9ac-hj-np-z]{6,}$/;

/**
 * Server action: fetch one by-address batch for the client tx list. Cosmoshub-gated. Non-cosmoshub
 * and empty address sets short-circuit to an empty OK result (mirrors the SSR gate). A thrown/error
 * batch surfaces as SERVICE_ERROR; malformed input as INVALID_REQUEST — the client maps the code to
 * a localized message and a Retry affordance.
 */
export const getTxsBatch = async (
  addresses: string[],
  chainName: string,
  cursor?: Cursor,
): Promise<TxBatchResult> => {
  try {
    if (chainName.toLowerCase() !== COSMOSHUB) {
      return { ok: true, rows: [], nextCursor: null, hasMore: false };
    }

    const list = addresses.filter(Boolean);
    if (!list.length) {
      return { ok: true, rows: [], nextCursor: null, hasMore: false };
    }
    if (!list.every((address) => BECH32.test(address))) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }

    const batch = await TxService.getCosmosTxsBatch(list, cursor);
    if (batch.error) {
      return { ok: false, code: 'SERVICE_ERROR' };
    }

    return { ok: true, rows: batch.rows, nextCursor: batch.nextCursor, hasMore: batch.hasMore };
  } catch (error) {
    logError(`getTxsBatch failed: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, code: 'SERVICE_ERROR' };
  }
};
