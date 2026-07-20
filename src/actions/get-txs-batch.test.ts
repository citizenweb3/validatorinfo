import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import type { Cursor, TxByAddressBatch } from '@/services/tx-service';
import type { TxFiltersInput } from '@/utils/tx-filters';

const EMPTY_FILTER_INPUT: TxFiltersInput = {
  mt: [],
  from: null,
  to: null,
  min: null,
  max: null,
};

const VALID_ADDRESS = 'cosmos1qqqqqq';

test('transaction batch action gates requests and preserves result discriminants', async (context) => {
  type TxServiceModule = typeof import('@/services/tx-service');
  type GetTxsByAddressBatch = TxServiceModule['default']['getTxsByAddressBatch'];
  type ModuleMockTracker = typeof context.mock & {
    module: (specifier: string, options: { defaultExport: unknown }) => unknown;
  };

  const calls: Parameters<GetTxsByAddressBatch>[] = [];
  let outcome: TxByAddressBatch | Error = { rows: [], nextCursor: null, hasMore: false };
  const txServiceStub: Pick<TxServiceModule['default'], 'getTxsByAddressBatch'> = {
    getTxsByAddressBatch: async (...args) => {
      calls.push(args);
      if (outcome instanceof Error) throw outcome;
      return outcome;
    },
  };
  const txServiceModuleUrl = pathToFileURL(path.resolve('src/app/services/tx-service.ts')).href;
  (context.mock as ModuleMockTracker).module(txServiceModuleUrl, { defaultExport: txServiceStub });
  const { getTxsBatch } = await import('@/actions/get-txs-batch');

  assert.deepEqual(await getTxsBatch([VALID_ADDRESS], 'unsupported', EMPTY_FILTER_INPUT), {
    ok: true,
    rows: [],
    nextCursor: null,
    hasMore: false,
  });
  assert.deepEqual(await getTxsBatch(['not-bech32'], 'cosmoshub', EMPTY_FILTER_INPUT), {
    ok: false,
    code: 'INVALID_REQUEST',
  });
  assert.deepEqual(await getTxsBatch([VALID_ADDRESS], 'cosmoshub', { ...EMPTY_FILTER_INPUT, min: '001' }), {
    ok: false,
    code: 'INVALID_REQUEST',
  });
  assert.equal(calls.length, 0);

  const cursor: Cursor = { before_height: '100', before_index: 4 };
  outcome = { rows: [], nextCursor: { before_height: '90', before_index: 2 }, hasMore: true };
  assert.deepEqual(await getTxsBatch(['', VALID_ADDRESS], 'cosmoshub', EMPTY_FILTER_INPUT, cursor), {
    ok: true,
    rows: [],
    nextCursor: { before_height: '90', before_index: 2 },
    hasMore: true,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.[0], 'cosmoshub');
  assert.deepEqual(calls[0]?.[1], [VALID_ADDRESS]);
  assert.deepEqual(calls[0]?.[2], {
    msgTypes: [],
    fromTime: null,
    toTime: null,
    minAmount: null,
    maxAmount: null,
  });
  assert.deepEqual(calls[0]?.[3], cursor);

  outcome = { rows: [], nextCursor: null, hasMore: false, error: true };
  assert.deepEqual(await getTxsBatch([VALID_ADDRESS], 'cosmoshub', EMPTY_FILTER_INPUT), {
    ok: false,
    code: 'SERVICE_ERROR',
  });

  outcome = new Error('indexer unavailable');
  assert.deepEqual(await getTxsBatch([VALID_ADDRESS], 'cosmoshub', EMPTY_FILTER_INPUT), {
    ok: false,
    code: 'SERVICE_ERROR',
  });
});
