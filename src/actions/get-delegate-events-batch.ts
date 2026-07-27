'use server';

import logger from '@/logger';
import DelegationService, { DEFAULT_DELEGATION_SORT } from '@/services/delegation-service';
import type { DelegationBatchResult, DelegationCursor, DelegationSort } from '@/services/delegation-service';

const { logError } = logger('get-delegate-events-batch');

const DELEGATION_CHAINS = new Set(['cosmoshub', 'atomone']);
const VALOPER_ADDRESS = /^[a-z0-9]+valoper1[02-9ac-hj-np-z]{6,}$/;

const isValidSort = (sort: DelegationSort): boolean =>
  (sort.sortBy === 'amount' || sort.sortBy === 'happened') && (sort.order === 'asc' || sort.order === 'desc');

const isValidCursor = (cursor: DelegationCursor | undefined, sort: DelegationSort): boolean => {
  if (!cursor) return true;

  if (sort.sortBy === 'amount') {
    if (cursor.before_amount === undefined || !/^\d{1,80}$/.test(cursor.before_amount)) return false;
  } else if (cursor.before_amount !== undefined) {
    return false;
  }

  return (
    /^\d+$/.test(cursor.before_height) &&
    Number.isInteger(cursor.before_index) &&
    cursor.before_index >= 0 &&
    Number.isInteger(cursor.before_msg_index) &&
    cursor.before_msg_index >= -1
  );
};

export const getDelegateEventsBatch = async (
  chainName: string,
  validator: string,
  sort: DelegationSort = DEFAULT_DELEGATION_SORT,
  cursor?: DelegationCursor,
): Promise<DelegationBatchResult> => {
  try {
    if (!DELEGATION_CHAINS.has(chainName.toLowerCase())) {
      return { ok: true, rows: [], nextCursor: null, hasMore: false };
    }

    if (!VALOPER_ADDRESS.test(validator)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }
    if (!isValidSort(sort)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }
    if (!isValidCursor(cursor, sort)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }

    const batch = await DelegationService.getDelegationsBatch(chainName, validator, sort, cursor);
    if (batch.error) {
      return { ok: false, code: 'SERVICE_ERROR' };
    }

    return { ok: true, rows: batch.rows, nextCursor: batch.nextCursor, hasMore: batch.hasMore };
  } catch (error) {
    logError(`getDelegateEventsBatch failed: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, code: 'SERVICE_ERROR' };
  }
};
