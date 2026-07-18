'use server';

import logger from '@/logger';
import AccountGovernanceService, { type AccountVotingHistoryActionResult } from '@/services/account-governance-service';
import { isGovVotesChainSupported } from '@/utils/governance-supported-chains';

const { logError } = logger('get-account-votes-batch');
const BECH32 = /^[a-z]+1[02-9ac-hj-np-z]{6,}$/;
const UNSIGNED_INTEGER = /^\d+$/;

export const getAccountVotesBatch = async (
  chainName: string,
  address: string,
  beforeProposalId?: string,
): Promise<AccountVotingHistoryActionResult> => {
  try {
    if (!isGovVotesChainSupported(chainName)) return { ok: false, code: 'INVALID_REQUEST' };
    if (!BECH32.test(address)) return { ok: false, code: 'INVALID_REQUEST' };
    if (beforeProposalId !== undefined && !UNSIGNED_INTEGER.test(beforeProposalId)) {
      return { ok: false, code: 'INVALID_REQUEST' };
    }

    const result = await AccountGovernanceService.getAccountVotingHistory(chainName, address, beforeProposalId);
    if (result.status !== 'ready') return { ok: false, code: 'SERVICE_ERROR' };
    return { ok: true, batch: result };
  } catch (error) {
    logError(`getAccountVotesBatch failed: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, code: 'SERVICE_ERROR' };
  }
};
