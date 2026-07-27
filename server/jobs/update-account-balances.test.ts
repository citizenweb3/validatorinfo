import { bech32 } from 'bech32';
import assert from 'node:assert/strict';
import test from 'node:test';

import { composeStoredAccountValue } from '@/utils/account-value';
import { accountViewedKey } from '@/utils/redis-keys';

const integrationDatabaseUrl = process.env.ACCOUNT_BALANCE_TEST_DATABASE_URL;
const integrationRedisUrl = process.env.ACCOUNT_BALANCE_TEST_REDIS_URL;

const encodeAddress = (prefix: string, byte: number): string =>
  bech32.encode(prefix, bech32.toWords(Uint8Array.from({ length: 20 }, () => byte)));

test(
  'the account balance job keeps first failures pending, refreshes exact values, retries safely, and prunes',
  { skip: !integrationDatabaseUrl || !integrationRedisUrl },
  async () => {
    assert.ok(integrationDatabaseUrl);
    assert.ok(integrationRedisUrl);
    assert.equal(process.env.DATABASE_URL, integrationDatabaseUrl);

    const [{ default: db }, { default: Redis }, { default: updateAccountBalances }] = await Promise.all([
      import('@/db'),
      import('ioredis'),
      import('@/server/jobs/update-account-balances'),
    ]);
    const redis = new Redis(integrationRedisUrl);
    const now = new Date('2026-07-17T10:00:00.000Z');
    const cosmosAddress = encodeAddress('cosmos', 1);
    const atomoneAddress = encodeAddress('atone', 2);
    const prunedAddress = encodeAddress('atone', 3);
    const firstRefreshFailureAddress = encodeAddress('cosmos', 4);
    const chainNames = ['cosmoshub', 'atomone'];
    const deleteFixtureChains = async () => {
      const chainWhere = { chain: { name: { in: chainNames } } };
      await db.accountBalance.deleteMany({ where: { chain: { name: { in: chainNames } } } });
      await db.chainNode.deleteMany({ where: chainWhere });
      await db.chainParams.deleteMany({ where: chainWhere });
      await db.chain.deleteMany({ where: { name: { in: chainNames } } });
    };
    const loadJson = async (chainName: string, path: string): Promise<unknown> => {
      const denom = chainName === 'cosmoshub' ? 'uatom' : 'uatone';
      if (path.includes(firstRefreshFailureAddress) && path.includes('/spendable_balances/')) {
        throw new Error('fixture first-refresh LCD outage');
      }
      if (path.includes('/spendable_balances/')) {
        return { balance: { denom, amount: chainName === 'cosmoshub' ? '100' : '200' } };
      }
      if (path.includes('/cosmos/staking/v1beta1/delegations/')) {
        return {
          delegation_responses: [
            { delegation: { validator_address: `${chainName}valoper1` }, balance: { denom, amount: '20' } },
          ],
          pagination: { next_key: null },
        };
      }
      if (path.endsWith('/rewards')) {
        return {
          rewards: [{ validator_address: `${chainName}valoper1`, reward: [{ denom, amount: '4.9' }] }],
        };
      }
      if (path.includes('/unbonding_delegations')) {
        return { unbonding_responses: [{ entries: [{ balance: '30' }] }], pagination: { next_key: null } };
      }
      throw new Error(`unexpected ${chainName} LCD path: ${path}`);
    };

    try {
      await redis.del(...chainNames.map(accountViewedKey));
      await deleteFixtureChains();
      await db.ecosystem.upsert({
        where: { name: 'cosmos' },
        create: { name: 'cosmos', prettyName: 'Cosmos', logoUrl: 'https://example.invalid/cosmos.svg' },
        update: {},
      });

      const createChain = async (
        name: string,
        chainId: string,
        denom: string,
        minimalDenom: string,
        bech32Prefix: string,
      ) =>
        db.chain.create({
          data: {
            ecosystem: 'cosmos',
            chainId,
            rang: 1,
            name,
            prettyName: name,
            logoUrl: 'https://example.invalid/chain.svg',
            coinGeckoId: name,
            twitterUrl: 'https://example.invalid/twitter',
            githubUrl: 'https://example.invalid/github',
            githubMainRepo: 'example/repo',
            params: { create: { coinType: 118, denom, minimalDenom, coinDecimals: 6, bech32Prefix } },
            chainNodes: { create: [{ type: 'rest', url: 'https://example.invalid/lcd' }] },
          },
        });

      const cosmosChain = await createChain('cosmoshub', 'cosmoshub-4', 'ATOM', 'uatom', 'cosmos');
      const atomoneChain = await createChain('atomone', 'atomone-1', 'ATONE', 'uatone', 'atone');
      await Promise.all([
        redis.zadd(accountViewedKey('cosmoshub'), now.getTime(), cosmosAddress),
        redis.zadd(accountViewedKey('cosmoshub'), now.getTime(), firstRefreshFailureAddress),
        redis.zadd(accountViewedKey('cosmoshub'), now.getTime(), 'invalid-route-param'),
        redis.zadd(accountViewedKey('atomone'), now.getTime(), atomoneAddress),
      ]);

      await updateAccountBalances({ redis, loadJsonOverride: loadJson, now: () => new Date(now) });

      const rows = await db.accountBalance.findMany({
        where: { updatedAt: { not: null } },
        orderBy: [{ chainId: 'asc' }, { address: 'asc' }],
      });
      assert.equal(rows.length, 2);
      assert.deepEqual(
        rows.map((row) => ({
          address: row.address,
          denom: row.denom,
          liquid: row.liquid.toFixed(0),
          staked: row.staked.toFixed(0),
          unbonding: row.unbonding.toFixed(0),
          rewards: row.rewards.toFixed(0),
          updatedAt: row.updatedAt?.toISOString(),
        })),
        [
          {
            address: cosmosAddress,
            denom: 'uatom',
            liquid: '100',
            staked: '20',
            unbonding: '30',
            rewards: '4',
            updatedAt: now.toISOString(),
          },
          {
            address: atomoneAddress,
            denom: 'uatone',
            liquid: '200',
            staked: '20',
            unbonding: '30',
            rewards: '4',
            updatedAt: now.toISOString(),
          },
        ],
      );
      const firstRefreshFailure = await db.accountBalance.findUniqueOrThrow({
        where: { chainId_address: { chainId: cosmosChain.id, address: firstRefreshFailureAddress } },
      });
      assert.equal(firstRefreshFailure.updatedAt, null);
      assert.deepEqual(
        composeStoredAccountValue(
          {
            denom: firstRefreshFailure.denom,
            liquid: firstRefreshFailure.liquid.toFixed(0),
            staked: firstRefreshFailure.staked.toFixed(0),
            unbonding: firstRefreshFailure.unbonding.toFixed(0),
            rewards: firstRefreshFailure.rewards.toFixed(0),
            updatedAt: firstRefreshFailure.updatedAt,
          },
          {
            coinDecimals: 6,
            denom: 'ATOM',
            minimalDenom: 'uatom',
          },
          null,
        ),
        { status: 'pending' },
      );
      assert.equal(await redis.zcard(accountViewedKey('cosmoshub')), 0);
      assert.equal(await redis.zcard(accountViewedKey('atomone')), 0);

      const later = new Date(now.getTime() + 11 * 60 * 1000);
      await db.accountBalance.update({
        where: { chainId_address: { chainId: cosmosChain.id, address: cosmosAddress } },
        data: { denom: 'legacy-uatom' },
      });
      await redis.zadd(accountViewedKey('cosmoshub'), later.getTime(), cosmosAddress);
      await updateAccountBalances({
        redis,
        loadJsonOverride: async (chainName, path) => {
          if (chainName === 'cosmoshub' && path.includes('/spendable_balances/')) {
            throw new Error('fixture LCD outage');
          }
          return loadJson(chainName, path);
        },
        now: () => new Date(later),
      });
      const failedRefresh = await db.accountBalance.findUniqueOrThrow({
        where: { chainId_address: { chainId: cosmosChain.id, address: cosmosAddress } },
      });
      assert.equal(failedRefresh.updatedAt?.toISOString(), now.toISOString());
      assert.equal(failedRefresh.lastViewedAt.toISOString(), later.toISOString());
      assert.equal(failedRefresh.denom, 'legacy-uatom');

      await db.accountBalance.create({
        data: {
          chainId: atomoneChain.id,
          address: prunedAddress,
          denom: 'uatone',
          lastViewedAt: new Date(later.getTime() - 91 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(later.getTime() - 91 * 24 * 60 * 60 * 1000),
        },
      });
      await redis.zadd(accountViewedKey('cosmoshub'), now.getTime() - 1_000, cosmosAddress);
      await updateAccountBalances({ redis, loadJsonOverride: loadJson, now: () => new Date(later) });
      assert.equal(await db.accountBalance.count({ where: { address: prunedAddress } }), 0);
      const recencyAfterOlderRetry = await db.accountBalance.findUniqueOrThrow({
        where: { chainId_address: { chainId: cosmosChain.id, address: cosmosAddress } },
      });
      assert.equal(recencyAfterOlderRetry.lastViewedAt.toISOString(), later.toISOString());
    } finally {
      try {
        await redis.del(...chainNames.map(accountViewedKey));
        await deleteFixtureChains();
      } finally {
        await redis.quit();
        await db.$disconnect();
      }
    }
  },
);
