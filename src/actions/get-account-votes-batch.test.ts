import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import type { AccountVotingHistoryReady, AccountVotingHistoryResult } from '@/services/account-governance-service';

const VALID_ADDRESS = 'cosmos1qqqqqq';
const READY: AccountVotingHistoryReady = {
  status: 'ready',
  rows: [],
  hasMore: false,
  nextBeforeProposalId: null,
  totalVotes: '0',
  totalClosedProposals: 10,
};

test('account votes action validates input and preserves service results', async (context) => {
  type GovernanceServiceModule = typeof import('@/services/account-governance-service');
  type GetAccountVotingHistory = GovernanceServiceModule['default']['getAccountVotingHistory'];
  type ModuleMockTracker = typeof context.mock & {
    module: (specifier: string, options: { defaultExport: unknown }) => unknown;
  };

  const calls: Parameters<GetAccountVotingHistory>[] = [];
  let outcome: AccountVotingHistoryResult | Error = READY;
  const serviceStub: Pick<GovernanceServiceModule['default'], 'getAccountVotingHistory'> = {
    getAccountVotingHistory: async (...args) => {
      calls.push(args);
      if (outcome instanceof Error) throw outcome;
      return outcome;
    },
  };
  const serviceModuleUrl = pathToFileURL(path.resolve('src/app/services/account-governance-service.ts')).href;
  (context.mock as ModuleMockTracker).module(serviceModuleUrl, { defaultExport: serviceStub });
  const { getAccountVotesBatch } = await import('@/actions/get-account-votes-batch');

  assert.deepEqual(await getAccountVotesBatch('unsupported', VALID_ADDRESS), {
    ok: false,
    code: 'INVALID_REQUEST',
  });
  assert.deepEqual(await getAccountVotesBatch('cosmoshub', 'bad'), {
    ok: false,
    code: 'INVALID_REQUEST',
  });
  assert.deepEqual(await getAccountVotesBatch('cosmoshub', VALID_ADDRESS, '1x'), {
    ok: false,
    code: 'INVALID_REQUEST',
  });
  assert.equal(calls.length, 0);

  assert.deepEqual(await getAccountVotesBatch('cosmoshub', VALID_ADDRESS, '42'), {
    ok: true,
    batch: READY,
  });
  assert.deepEqual(calls, [['cosmoshub', VALID_ADDRESS, '42']]);

  outcome = { status: 'error' };
  assert.deepEqual(await getAccountVotesBatch('cosmoshub', VALID_ADDRESS), {
    ok: false,
    code: 'SERVICE_ERROR',
  });

  outcome = new Error('indexer unavailable');
  assert.deepEqual(await getAccountVotesBatch('cosmoshub', VALID_ADDRESS), {
    ok: false,
    code: 'SERVICE_ERROR',
  });
});
