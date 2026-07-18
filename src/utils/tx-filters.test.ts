import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTxByAddressCacheKey } from '@/utils/tx-cache-key';
import {
  EMPTY_TX_FILTERS,
  canonicalTxFilterKey,
  displayAmountToBaseUnits,
  formatLocalDateOnly,
  isTxAmountRangeValid,
  parseCanonicalTxFiltersInput,
  parseTxFiltersFromSearchParams,
  txFiltersToApiParams,
  txFiltersToInput,
} from '@/utils/tx-filters';
import { resolveTxMessageTypes } from '@/utils/tx-message-types';

test('transaction filters parse, normalize, and serialize deterministically', () => {
  const voteTypes = resolveTxMessageTypes('atomone', ['vote']);
  const filters = parseTxFiltersFromSearchParams(
    {
      mt: [voteTypes[1], voteTypes[0], voteTypes[0], '/unsupported.Msg'],
      from: '2026-07-01',
      to: '2026-07-18',
      min: '00000100',
      max: '200',
    },
    'atomone',
  );

  assert.deepEqual(filters.msgTypes, voteTypes);
  assert.equal(filters.fromTime, '2026-07-01T00:00:00.000Z');
  assert.equal(filters.toTime, '2026-07-18T23:59:59.999Z');
  assert.equal(filters.minAmount, '100');
  assert.equal(filters.maxAmount, '200');
  assert.deepEqual(parseCanonicalTxFiltersInput(txFiltersToInput(filters), 'atomone'), filters);
  assert.match(canonicalTxFilterKey(filters), /^mt:/);
});

test('invalid URL filter pairs are dropped and canonical action input fails closed', () => {
  const filters = parseTxFiltersFromSearchParams(
    { mt: '/unsupported.Msg', from: '2026-02-30', to: '2026-01-01', min: '9', max: '2' },
    'cosmoshub',
  );

  assert.deepEqual(filters, {
    ...EMPTY_TX_FILTERS,
    toTime: '2026-01-01T23:59:59.999Z',
  });
  assert.equal(
    parseCanonicalTxFiltersInput({ mt: ['/unsupported.Msg'], from: null, to: null, min: null, max: null }, 'cosmoshub'),
    null,
  );
});

test('display amounts convert exactly to bounded base-unit integers', () => {
  assert.equal(displayAmountToBaseUnits('12.5', 6), '12500000');
  assert.equal(displayAmountToBaseUnits('0.000001', 6), '1');
  assert.equal(displayAmountToBaseUnits('0.0000001', 6), null);
  assert.equal(displayAmountToBaseUnits('-1', 6), null);
  assert.equal(displayAmountToBaseUnits('1e6', 6), null);
  assert.equal(isTxAmountRangeValid('10', '10'), true);
  assert.equal(isTxAmountRangeValid('11', '10'), false);
  assert.equal(formatLocalDateOnly(new Date(2026, 6, 18, 23, 30)), '2026-07-18');
});

test('API mapping couples amount bounds to the trusted minimal denom', () => {
  const filters = parseTxFiltersFromSearchParams({ min: '10' }, 'cosmoshub');
  assert.deepEqual(txFiltersToApiParams(filters, 'uatom'), {
    msg_type: undefined,
    from_time: undefined,
    to_time: undefined,
    min_amount: '10',
    max_amount: undefined,
    amount_denom: 'uatom',
  });
  assert.throws(() => txFiltersToApiParams(filters), /minimal denom/);
  assert.equal(canonicalTxFilterKey(EMPTY_TX_FILTERS), '');
});

test('unfiltered transaction cache keys retain their previous byte shape', () => {
  assert.equal(
    buildTxByAddressCacheKey({
      chainName: 'cosmoshub',
      addresses: 'cosmos1operator,cosmos1account',
      filterKey: '',
      cursorKey: 'head',
    }),
    'txs:byaddr:cosmoshub:cosmos1account,cosmos1operator:head',
  );
  assert.equal(
    buildTxByAddressCacheKey({
      chainName: 'cosmoshub',
      addresses: 'cosmos1account',
      filterKey: 'min:10',
      cursorKey: 'head',
    }),
    'txs:byaddr:cosmoshub:cosmos1account:min:10:head',
  );
});
