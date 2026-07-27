import assert from 'node:assert/strict';
import test from 'node:test';

import atomoneIndexer from '@/services/atomone-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import {
  type AccountFirstSeen,
  type AccountStakingDelta,
  composeDelegatedStakeSeries,
  drainAccountStakingDeltas,
  selectDelegatedStakeAtHeights,
  selectFirstSeenCandidate,
} from '@/utils/account-history';

const buildFirstSeen = (overrides: Partial<AccountFirstSeen> = {}): AccountFirstSeen => ({
  height: '10',
  time: '2020-01-10T00:00:00.000Z',
  atOrBefore: false,
  source: 'indexed',
  ...overrides,
});

const buildDelta = (overrides: Partial<AccountStakingDelta> = {}): AccountStakingDelta => ({
  height: '10',
  tx_index: 0,
  msg_index: 0,
  tx_hash: 'A',
  time: '2020-01-10T00:00:00.000Z',
  event_type: 'delegate',
  validator_src: null,
  validator_dst: 'cosmosvaloper1validator',
  denom: 'uatom',
  amount: '1',
  sign: 1,
  source: 'event',
  ...overrides,
});

const restoreEnv = (key: string, value: string | undefined): void => {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
};

test('first-seen composition chooses genesis, incoming indexed activity, or honest unknown', () => {
  const cosmosGenesis = buildFirstSeen({
    height: '1',
    time: '2019-01-01T00:00:00.000Z',
    atOrBefore: true,
    source: 'genesis',
  });
  const atomoneGenesis = buildFirstSeen({
    height: '1',
    time: '2024-02-27T00:00:00.000Z',
    source: 'genesis',
  });
  const incomingOnly = buildFirstSeen({ source: 'indexed' });

  assert.deepEqual(selectFirstSeenCandidate(cosmosGenesis, incomingOnly), cosmosGenesis);
  assert.deepEqual(selectFirstSeenCandidate(atomoneGenesis, incomingOnly), atomoneGenesis);
  assert.deepEqual(selectFirstSeenCandidate(null, incomingOnly), incomingOnly);
  assert.deepEqual(
    selectFirstSeenCandidate(buildFirstSeen({ height: '20', source: 'genesis' }), incomingOnly),
    incomingOnly,
  );
  assert.equal(selectFirstSeenCandidate(null, null), null);
});

test('staking delta pagination drains the atomic cursor and preserves warning metadata', async () => {
  const requestedCursors: unknown[] = [];
  const result = await drainAccountStakingDeltas(async (cursor) => {
    requestedCursors.push(cursor);
    if (!cursor) {
      return {
        data: [buildDelta({ height: '20', tx_index: 2, msg_index: 1 })],
        cursor: { next_before_height: '20', next_before_index: 2, next_before_msg_index: 1 },
        has_more: true,
        total: '2',
        meta: { skipped_ambiguous_msgexec: '1' },
      };
    }
    return {
      data: [buildDelta({ height: '10' })],
      cursor: null,
      has_more: false,
      total: '2',
      meta: { skipped_ambiguous_msgexec: '1' },
    };
  });

  assert.deepEqual(requestedCursors, [
    null,
    { next_before_height: '20', next_before_index: 2, next_before_msg_index: 1 },
  ]);
  assert.equal(result.rows.length, 2);
  assert.equal(result.total, '2');
  assert.equal(result.skippedAmbiguousMsgExec, '1');
});

test('staking delta pagination rejects repeated cursors and totals beyond the bounded drain', async () => {
  await assert.rejects(
    drainAccountStakingDeltas(async () => ({
      data: [buildDelta()],
      cursor: { next_before_height: '10', next_before_index: 0, next_before_msg_index: 0 },
      has_more: true,
      total: '2',
      meta: { skipped_ambiguous_msgexec: '0' },
    })),
    /repeated its cursor/,
  );

  await assert.rejects(
    drainAccountStakingDeltas(async () => ({
      data: [],
      cursor: null,
      has_more: false,
      total: '100001',
      meta: { skipped_ambiguous_msgexec: '0' },
    })),
    /total exceeds 100000 rows/,
  );

  await assert.rejects(
    drainAccountStakingDeltas(async () => ({
      data: [buildDelta({ height: '10' })],
      cursor: { next_before_height: '9', next_before_index: 0, next_before_msg_index: 0 },
      has_more: true,
      total: '2',
      meta: { skipped_ambiguous_msgexec: '0' },
    })),
    /cursor does not match the final page row/,
  );

  await assert.rejects(
    drainAccountStakingDeltas(async () => ({
      data: [buildDelta()],
      cursor: null,
      has_more: false,
      total: '0',
      meta: { skipped_ambiguous_msgexec: '0' },
    })),
    /total is smaller than the drained row count/,
  );
});

test('genesis baseline plus signed deltas composes an exact clamped JSON-safe series', () => {
  const series = composeDelegatedStakeSeries(
    '1',
    [
      { denom: 'uatom', amount: '80' },
      { denom: 'uatom', amount: '20' },
      { denom: 'ufoo', amount: '0' },
    ],
    [
      buildDelta({ height: '13', tx_hash: 'D', event_type: 'redelegate', sign: 0, amount: '999' }),
      buildDelta({ height: '11', tx_hash: 'B', event_type: 'unbond', sign: -1, amount: '200' }),
      buildDelta({ height: '10', tx_hash: 'A', amount: '50' }),
      buildDelta({ height: '14', tx_hash: 'E', denom: 'ufoo', amount: '5' }),
      buildDelta({ height: '12', tx_hash: 'C', event_type: 'cancel_unbonding_delegation', amount: '20' }),
    ],
  );
  const values = selectDelegatedStakeAtHeights(series, ['0', '1', '10', '11', '12', '13', '14']);

  assert.deepEqual(values, [
    { height: '0', amounts: {} },
    { height: '1', amounts: { uatom: '100', ufoo: '0' } },
    { height: '10', amounts: { uatom: '150', ufoo: '0' } },
    { height: '11', amounts: { uatom: '0', ufoo: '0' } },
    { height: '12', amounts: { uatom: '20', ufoo: '0' } },
    { height: '13', amounts: { uatom: '20', ufoo: '0' } },
    { height: '14', amounts: { uatom: '20', ufoo: '5' } },
  ]);
  assert.doesNotThrow(() => JSON.stringify({ series, values, skippedAmbiguousMsgExec: '1' }));
});

test('delegated stake math preserves integers beyond Number precision', () => {
  const series = composeDelegatedStakeSeries(
    '1',
    [{ denom: 'uatom', amount: '99999999999999999999999999999999999999' }],
    [buildDelta({ height: '2', amount: '1' })],
  );
  assert.deepEqual(selectDelegatedStakeAtHeights(series, ['2']), [
    { height: '2', amounts: { uatom: '100000000000000000000000000000000000000' } },
  ]);
});

test('Cosmos Hub and AtomOne account-fact clients preserve the same paths and cursor contract', async () => {
  const originalFetch = globalThis.fetch;
  const originalCosmosBaseUrl = process.env.COSMOS_INDEXER_BASE_URL;
  const originalCosmosApiKey = process.env.COSMOS_INDEXER_API_KEY;
  const originalAtomoneBaseUrl = process.env.ATOMONE_INDEXER_BASE_URL;
  const originalAtomoneApiKey = process.env.ATOMONE_INDEXER_API_KEY;
  const requests: Array<{ url: string; apiKey: string | null }> = [];

  process.env.COSMOS_INDEXER_BASE_URL = 'https://cosmos.example';
  process.env.COSMOS_INDEXER_API_KEY = 'cosmos-key';
  process.env.ATOMONE_INDEXER_BASE_URL = 'https://atomone.example';
  process.env.ATOMONE_INDEXER_API_KEY = 'atomone-key';
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    requests.push({ url: url.toString(), apiKey: new Headers(init?.headers).get('x-api-key') });
    if (url.pathname === '/api/v1/coverage') {
      return Response.json({ data: { earliest_height: '1', earliest_time: '2020-01-01T00:00:00.000Z' } });
    }
    if (url.pathname === '/api/v1/address/earliest-activity') {
      return Response.json({
        data: {
          earliest: {
            height: '2',
            tx_index: 0,
            tx_hash: 'INCOMING',
            time: '2020-01-02T00:00:00.000Z',
            source: 'transfer_in',
          },
          coverage: { earliest_height: '1', earliest_time: '2020-01-01T00:00:00.000Z' },
        },
      });
    }
    return Response.json({
      data: [],
      cursor: null,
      has_more: false,
      total: '0',
      meta: { skipped_ambiguous_msgexec: '0' },
    });
  };

  try {
    for (const client of [cosmosIndexer, atomoneIndexer]) {
      await client.getCoverage({ timeout: 100 });
      const earliest = await client.getEarliestActivity('cosmos1account', { timeout: 100 });
      assert.equal(earliest?.data.earliest?.source, 'transfer_in');
      await client.getStakingDeltas(
        {
          delegator: 'cosmos1account',
          limit: 100,
          before_height: '10',
          before_index: 2,
          before_msg_index: -1,
        },
        { timeout: 100 },
      );
    }
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv('COSMOS_INDEXER_BASE_URL', originalCosmosBaseUrl);
    restoreEnv('COSMOS_INDEXER_API_KEY', originalCosmosApiKey);
    restoreEnv('ATOMONE_INDEXER_BASE_URL', originalAtomoneBaseUrl);
    restoreEnv('ATOMONE_INDEXER_API_KEY', originalAtomoneApiKey);
  }

  assert.deepEqual(
    requests.map(({ url, apiKey }) => ({ origin: new URL(url).origin, path: new URL(url).pathname, apiKey })),
    [
      { origin: 'https://cosmos.example', path: '/api/v1/coverage', apiKey: 'cosmos-key' },
      { origin: 'https://cosmos.example', path: '/api/v1/address/earliest-activity', apiKey: 'cosmos-key' },
      { origin: 'https://cosmos.example', path: '/api/v1/staking/deltas', apiKey: 'cosmos-key' },
      { origin: 'https://atomone.example', path: '/api/v1/coverage', apiKey: 'atomone-key' },
      { origin: 'https://atomone.example', path: '/api/v1/address/earliest-activity', apiKey: 'atomone-key' },
      { origin: 'https://atomone.example', path: '/api/v1/staking/deltas', apiKey: 'atomone-key' },
    ],
  );
  const stakingUrl = new URL(requests[2].url);
  assert.equal(stakingUrl.searchParams.get('before_height'), '10');
  assert.equal(stakingUrl.searchParams.get('before_index'), '2');
  assert.equal(stakingUrl.searchParams.get('before_msg_index'), '-1');
});

test('coverage and earliest-activity clients map API 404 to honest null', async () => {
  const originalFetch = globalThis.fetch;
  const originalBaseUrl = process.env.COSMOS_INDEXER_BASE_URL;
  process.env.COSMOS_INDEXER_BASE_URL = 'https://cosmos.example';
  globalThis.fetch = async () => Response.json({ error: 'not_found' }, { status: 404 });

  try {
    assert.equal(await cosmosIndexer.getCoverage({ timeout: 100 }), null);
    assert.equal(await cosmosIndexer.getEarliestActivity('cosmos1account', { timeout: 100 }), null);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv('COSMOS_INDEXER_BASE_URL', originalBaseUrl);
  }
});
