import assert from 'node:assert/strict';
import test from 'node:test';

import {
  composeAccountDelegationRows,
  fetchAllLcdDelegations,
  isAccountDelegationsChainSupported,
  parseLcdDelegationPage,
  parseLcdRewardsByValidator,
} from '@/utils/cosmos-account-delegations';
import {
  addUnsignedDecimalStrings,
  compareUnsignedDecimalStrings,
  formatBaseUnits,
  formatDecimalForDisplay,
} from '@/utils/decimal-string';
import { fetchJsonWithFailover } from '@/utils/lcd-request';

test('decimal helpers preserve base-unit precision without Number conversion', () => {
  assert.equal(addUnsignedDecimalStrings('999999999999999999999999.123', '0.877'), '1000000000000000000000000');
  assert.equal(formatBaseUnits('1234567', 6), '1.234567');
  assert.equal(formatBaseUnits('2660.123456789', 6), '0.002660123456789');
  assert.equal(formatDecimalForDisplay('0.002660123456789'), '0.002660');
  assert.equal(compareUnsignedDecimalStrings('2.0', '1.999999999999999999'), 1);
  assert.throws(() => formatBaseUnits('1e6', 6), /invalid unsigned decimal string/);
});

test('account delegations are feature-gated to the two implemented Cosmos chains', () => {
  assert.equal(isAccountDelegationsChainSupported('cosmoshub'), true);
  assert.equal(isAccountDelegationsChainSupported('ATOMONE'), true);
  assert.equal(isAccountDelegationsChainSupported('osmosis'), false);
});

test('LCD requests preserve endpoint base paths and fail over after explicit non-2xx responses', async () => {
  const requestedUrls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    requestedUrls.push(String(input));
    if (requestedUrls.length === 1) return new Response('unavailable', { status: 503 });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const result = await fetchJsonWithFailover<{ ok: boolean }>(
    ['https://first.example/base/', 'https://second.example/rest'],
    '/cosmos/staking/v1beta1/params',
    { fetcher, timeoutMs: 100 },
  );
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(requestedUrls, [
    'https://first.example/base/cosmos/staking/v1beta1/params',
    'https://second.example/rest/cosmos/staking/v1beta1/params',
  ]);
});

test('LCD failover reports exhaustion without accepting an error body as data', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({ code: 12 }), { status: 501 });
  await assert.rejects(
    fetchJsonWithFailover(['https://first.example', 'https://second.example'], '/unimplemented', {
      fetcher,
      timeoutMs: 100,
    }),
    /all 2 LCD endpoints failed: HTTP 501/,
  );
});

test('LCD failover continues after a timed-out endpoint', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    if (calls === 1) throw new DOMException('timed out', 'TimeoutError');
    return new Response(JSON.stringify({ height: '1' }), { status: 200 });
  };
  const result = await fetchJsonWithFailover<{ height: string }>(
    ['https://slow.example', 'https://healthy.example'],
    '/cosmos/base/tendermint/v1beta1/blocks/latest',
    { fetcher, timeoutMs: 100 },
  );
  assert.deepEqual(result, { height: '1' });
  assert.equal(calls, 2);
});

test('delegation pages drain with encoded cursors and compose exact rewards plus batch identities', async () => {
  const requestedPaths: string[] = [];
  const positions = await fetchAllLcdDelegations('cosmos1delegator', 'uatom', async (path) => {
    requestedPaths.push(path);
    const cursor = new URL(path, 'https://lcd.invalid').searchParams.get('pagination.key');
    if (!cursor) {
      return {
        delegation_responses: [
          {
            delegation: { validator_address: 'cosmosvaloper1' },
            balance: { denom: 'uatom', amount: '1000000' },
          },
          {
            delegation: { validator_address: 'cosmosvaloper2' },
            balance: { denom: 'uatom', amount: '2000000' },
          },
        ],
        pagination: { next_key: 'next/+' },
      };
    }
    assert.equal(cursor, 'next/+');
    return {
      delegation_responses: [
        {
          delegation: { validator_address: 'cosmosvaloper1' },
          balance: { denom: 'uatom', amount: '500000' },
        },
      ],
      pagination: { next_key: null },
    };
  });
  assert.equal(requestedPaths.length, 2);

  const rewards = parseLcdRewardsByValidator(
    {
      rewards: [
        {
          validator_address: 'cosmosvaloper1',
          reward: [
            { denom: 'uatom', amount: '2000.123456789' },
            { denom: 'uother', amount: '999999999' },
          ],
        },
        {
          validator_address: 'cosmosvaloper1',
          reward: [{ denom: 'uatom', amount: '660' }],
        },
      ],
    },
    'uatom',
  );
  const rows = composeAccountDelegationRows(
    positions,
    rewards,
    [
      {
        operatorAddress: 'cosmosvaloper1',
        validatorId: 42,
        moniker: 'Known validator',
        icon: 'https://example.invalid/icon.svg',
      },
    ],
    6,
  );

  assert.deepEqual(rows, [
    {
      operatorAddress: 'cosmosvaloper2',
      validatorId: null,
      validatorName: 'cosmosvaloper2',
      validatorIcon: null,
      stakedAmount: '2',
      rewardAmount: '0',
    },
    {
      operatorAddress: 'cosmosvaloper1',
      validatorId: 42,
      validatorName: 'Known validator',
      validatorIcon: 'https://example.invalid/icon.svg',
      stakedAmount: '1.5',
      rewardAmount: '0.002660123456789',
    },
  ]);
});

test('delegation parsing rejects wrong denoms instead of displaying mixed-chain values', () => {
  assert.throws(
    () =>
      parseLcdDelegationPage(
        {
          delegation_responses: [
            {
              delegation: { validator_address: 'cosmosvaloper1' },
              balance: { denom: 'uatone', amount: '1' },
            },
          ],
          pagination: null,
        },
        'uatom',
      ),
    /delegation denom mismatch/,
  );
});

test('an account with no staking positions composes to an honest empty row set', async () => {
  const positions = await fetchAllLcdDelegations('cosmos1empty', 'uatom', async () => ({
    delegation_responses: [],
    pagination: { next_key: null },
  }));
  assert.deepEqual(composeAccountDelegationRows(positions, new Map(), [], 6), []);
});

test('delegation pagination stops on a repeated next key', async () => {
  let calls = 0;
  await assert.rejects(
    fetchAllLcdDelegations('cosmos1delegator', 'uatom', async () => {
      calls++;
      return { delegation_responses: [], pagination: { next_key: 'repeat' } };
    }),
    /repeated next_key/,
  );
  assert.equal(calls, 2);
});

test('delegation pagination enforces the total page cap', async () => {
  let calls = 0;
  await assert.rejects(
    fetchAllLcdDelegations('cosmos1delegator', 'uatom', async () => {
      calls++;
      return { delegation_responses: [], pagination: { next_key: `cursor-${calls}` } };
    }),
    /pagination exceeds 50 pages/,
  );
  assert.equal(calls, 50);
});
