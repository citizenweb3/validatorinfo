import { bech32 } from 'bech32';
import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeBech32Address } from '@/utils/bech32-address';
import {
  fetchAllLcdUnbonding,
  fetchCosmosAccountBalanceParts,
  parseLcdSpendableBalance,
  parseLcdUnbondingPage,
} from '@/utils/cosmos-account-balances';
import { floorUnsignedDecimal, normalizeUnsignedInteger } from '@/utils/decimal-string';

const encodeAddress = (prefix: string, byte: number): string =>
  bech32.encode(prefix, bech32.toWords(Uint8Array.from({ length: 20 }, () => byte)));

test('bech32 addresses are checksum-validated, HRP-gated, and canonicalized', () => {
  const cosmosAddress = encodeAddress('cosmos', 7);

  assert.equal(normalizeBech32Address(` ${cosmosAddress.toUpperCase()} `, 'cosmos'), cosmosAddress);
  assert.equal(normalizeBech32Address(cosmosAddress, 'atone'), null);
  assert.equal(normalizeBech32Address(`${cosmosAddress.slice(0, -1)}x`, 'cosmos'), null);
  assert.equal(normalizeBech32Address('not-an-address', 'cosmos'), null);
});

test('integer helpers preserve exact values and floor only DecCoin rewards', () => {
  assert.equal(normalizeUnsignedInteger('000123.000'), '123');
  assert.equal(floorUnsignedDecimal('900719925474099312345.999999999999999999'), '900719925474099312345');
  assert.throws(() => normalizeUnsignedInteger('1.000000000000000001'), /fractional units/);
});

test('spendable balance parsing matches live Cosmos Hub and AtomOne response shapes', () => {
  assert.equal(parseLcdSpendableBalance({ balance: { denom: 'uatom', amount: '2565585' } }, 'uatom'), '2565585');
  assert.equal(
    parseLcdSpendableBalance({ balance: { denom: 'uatone', amount: '1950916836' } }, 'uatone'),
    '1950916836',
  );
  assert.equal(parseLcdSpendableBalance({ balance: null }, 'uatom'), '0');
  assert.throws(
    () => parseLcdSpendableBalance({ balance: { denom: 'uatone', amount: '1' } }, 'uatom'),
    /denom mismatch/,
  );
});

test('unbonding parsing sums multiple validators and entries exactly', () => {
  const parsed = parseLcdUnbondingPage({
    unbonding_responses: [
      {
        validator_address: 'cosmosvaloper1a',
        entries: [{ balance: '900719925474099312345' }, { balance: '5' }],
      },
      {
        validator_address: 'cosmosvaloper1b',
        entries: [{ balance: '10' }],
      },
    ],
    pagination: { next_key: 'next/+' },
  });

  assert.deepEqual(parsed, {
    amount: '900719925474099312360',
    entryCount: 3,
    nextKey: 'next/+',
  });
});

test('unbonding pages drain encoded cursors and retain the live empty shape', async () => {
  const paths: string[] = [];
  const amount = await fetchAllLcdUnbonding('cosmos1delegator', async (path) => {
    paths.push(path);
    const cursor = new URL(path, 'https://lcd.invalid').searchParams.get('pagination.key');
    if (!cursor) {
      return {
        unbonding_responses: [{ entries: [{ balance: '12' }, { balance: '3' }] }],
        pagination: { next_key: 'next/+' },
      };
    }
    assert.equal(cursor, 'next/+');
    return { unbonding_responses: [], pagination: { next_key: null, total: '0' } };
  });

  assert.equal(amount, '15');
  assert.equal(paths.length, 2);
});

test('unbonding pagination stops on a repeated cursor', async () => {
  let calls = 0;
  await assert.rejects(
    fetchAllLcdUnbonding('cosmos1delegator', async () => {
      calls += 1;
      return { unbonding_responses: [], pagination: { next_key: 'repeat' } };
    }),
    /repeated next_key/,
  );
  assert.equal(calls, 2);
});

test('account balance aggregation fetches all four components concurrently and floors total rewards once', async () => {
  const requestedKinds = new Set<string>();
  const parts = await fetchCosmosAccountBalanceParts('cosmos1delegator', 'uatom', async (path) => {
    if (path.includes('/spendable_balances/')) {
      requestedKinds.add('liquid');
      return { balance: { denom: 'uatom', amount: '1000000' } };
    }
    if (path.includes('/delegations/')) {
      requestedKinds.add('staked');
      return {
        delegation_responses: [
          { delegation: { validator_address: 'cosmosvaloper1a' }, balance: { denom: 'uatom', amount: '20' } },
          { delegation: { validator_address: 'cosmosvaloper1b' }, balance: { denom: 'uatom', amount: '30' } },
        ],
        pagination: { next_key: null },
      };
    }
    if (path.endsWith('/rewards')) {
      requestedKinds.add('rewards');
      return {
        rewards: [
          { validator_address: 'cosmosvaloper1a', reward: [{ denom: 'uatom', amount: '1.7' }] },
          { validator_address: 'cosmosvaloper1b', reward: [{ denom: 'uatom', amount: '2.4' }] },
        ],
      };
    }
    if (path.includes('/unbonding_delegations')) {
      requestedKinds.add('unbonding');
      return { unbonding_responses: [{ entries: [{ balance: '40' }] }], pagination: { next_key: null } };
    }
    throw new Error(`unexpected LCD path: ${path}`);
  });

  assert.deepEqual(parts, { liquid: '1000000', staked: '50', unbonding: '40', rewards: '4' });
  assert.deepEqual(Array.from(requestedKinds).sort(), ['liquid', 'rewards', 'staked', 'unbonding']);
});
