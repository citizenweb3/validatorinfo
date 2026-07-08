'use server';

import logger from '@/logger';
import DelegationService from '@/services/delegation-service';
import type { DelegationBatchResult, DelegationCursor } from '@/services/delegation-service';

const { logError } = logger('get-delegate-events-batch');

const DELEGATION_CHAINS = new Set(['cosmoshub', 'atomone']);
const VALOPER_ADDRESS = /^[a-z0-9]+valoper1[02-9ac-hj-np-z]{6,}$/;

const isValidCursor = (cursor: DelegationCursor | undefined): boolean => {
  if (!cursor) return true;

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
  cursor?: DelegationCursor,
): Promise<DelegationBatchResult> => {
  try {
    if (!DELEGATION_CHAINS.has(chainName.toLowerCase())) {
      return { ok: true, rows: [], nextCursor: null, hasMore: false };
    }

    if (!VALOPER_ADDRESS.test(validator)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }
    if (!isValidCursor(cursor)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }

    const batch = await DelegationService.getDelegationsBatch(chainName, validator, cursor);
    if (batch.error) {
      return { ok: false, code: 'SERVICE_ERROR' };
    }

    return { ok: true, rows: batch.rows, nextCursor: batch.nextCursor, hasMore: batch.hasMore };
  } catch (error) {
    logError(`getDelegateEventsBatch failed: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, code: 'SERVICE_ERROR' };
  }
};
