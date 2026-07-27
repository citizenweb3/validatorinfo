'use server';

import logger from '@/logger';
import TxService from '@/services/tx-service';
import type { Cursor, TxByAddressBatchResult } from '@/services/tx-service';
import { parseCanonicalTxFiltersInput, type TxFiltersInput } from '@/utils/tx-filters';
import { isTxByAddressChainSupported } from '@/utils/tx-supported-chains';

const { logError } = logger('get-txs-batch');

// Loose bech32 shape: <hrp>1<data>. Accepts account + operator forms for any hrp (`cosmos1…`,
// `cosmosvaloper1…`, `atone1…`, `atonevaloper1…` — the validator feed sends both). The indexer
// validates strictly server-side; this is a cheap pre-filter so a malformed input fails fast as
// INVALID_REQUEST instead of hitting the indexer.
const BECH32 = /^[a-z]+1[02-9ac-hj-np-z]{6,}$/;

/**
 * Server action: fetch one by-address batch for the client tx list. Gated to chains with a
 * per-address indexer (cosmoshub, atomone). Unsupported chains and empty address sets short-circuit
 * to an empty OK result (mirrors the SSR gate). A thrown/error batch surfaces as SERVICE_ERROR;
 * malformed input as INVALID_REQUEST — the client maps the code to a localized message and a Retry
 * affordance.
 */
export const getTxsBatch = async (
  addresses: string[],
  chainName: string,
  filterInput: TxFiltersInput,
  cursor?: Cursor,
): Promise<TxByAddressBatchResult> => {
  try {
    if (!isTxByAddressChainSupported(chainName)) {
      return { ok: true, rows: [], nextCursor: null, hasMore: false };
    }

    const list = addresses.filter(Boolean);
    if (!list.length) {
      return { ok: true, rows: [], nextCursor: null, hasMore: false };
    }
    if (!list.every((address) => BECH32.test(address))) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }

    const filters = parseCanonicalTxFiltersInput(filterInput, chainName);
    if (!filters) return { ok: false, code: 'INVALID_REQUEST' };

    const batch = await TxService.getTxsByAddressBatch(chainName, list, filters, cursor);
    if (batch.error) {
      return { ok: false, code: 'SERVICE_ERROR' };
    }

    return { ok: true, rows: batch.rows, nextCursor: batch.nextCursor, hasMore: batch.hasMore };
  } catch (error) {
    logError(`getTxsBatch failed: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, code: 'SERVICE_ERROR' };
  }
};
