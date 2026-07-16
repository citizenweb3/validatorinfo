import { PrismaClient } from '@prisma/client';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { gzipSync } from 'node:zlib';
import { Client } from 'pg';

import { withAdvisoryLock } from '@/server/tools/advisory-lock';
import { extractGenesisAccountAddress } from '@/server/tools/genesis/accounts';
import { fetchGenesisCoverage } from '@/server/tools/genesis/coverage';
import { floorDelegationTokens, parseUnsignedDecimal } from '@/server/tools/genesis/decimal';
import {
  type VerifiedGenesisSource,
  assertVerifiedGenesisSourceUnchanged,
  cleanupVerifiedGenesisSource,
  fetchAndVerifyGenesisSource,
} from '@/server/tools/genesis/fetch-verify';
import type { GenesisProfile } from '@/server/tools/genesis/profile';
import { validateGenesisSource } from '@/server/tools/genesis/scan';
import type { GenesisValidationSummary } from '@/server/tools/genesis/types';
import { persistValidatedGenesis } from '@/server/tools/genesis/write-batches';

type FixtureHashes = {
  archiveSha256?: string;
  jsonSha256: string;
};

type VerifiedFixture = {
  file: VerifiedGenesisSource;
  profile: GenesisProfile;
  cleanup: () => Promise<void>;
};

const sha256 = (value: Buffer): string => createHash('sha256').update(value).digest('hex');

const createVerifiedFixture = async (
  document: Record<string, unknown>,
  format: 'json' | 'gzip',
  createProfile: (hashes: FixtureHashes) => GenesisProfile,
): Promise<VerifiedFixture> => {
  const json = Buffer.from(JSON.stringify(document));
  const source = format === 'gzip' ? gzipSync(json) : json;
  const hashes = {
    archiveSha256: format === 'gzip' ? sha256(source) : undefined,
    jsonSha256: sha256(json),
  };
  const profile = createProfile(hashes);
  const sourceDirectory = await mkdtemp(join(tmpdir(), 'validatorinfo-genesis-test-source-'));
  const sourcePath = join(sourceDirectory, format === 'gzip' ? 'genesis.json.gz' : 'genesis.json');
  await writeFile(sourcePath, source);

  try {
    const file = await fetchAndVerifyGenesisSource(profile, sourcePath);
    return {
      file,
      profile,
      cleanup: async () => {
        await cleanupVerifiedGenesisSource(file);
        await rm(sourceDirectory, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await rm(sourceDirectory, { recursive: true, force: true });
    throw error;
  }
};

const createCosmosDocument = (): Record<string, unknown> => ({
  genesis_time: '2020-01-01T00:00:00.000Z',
  chain_id: 'cosmoshub-4',
  initial_height: '10',
  app_state: {
    auth: {
      accounts: [
        { '@type': '/cosmos.auth.v1beta1.BaseAccount', address: 'cosmos1base' },
        {
          '@type': '/cosmos.vesting.v1beta1.DelayedVestingAccount',
          base_vesting_account: { base_account: { address: 'cosmos1vesting' } },
        },
      ],
    },
    staking: {
      params: { bond_denom: 'uatom' },
      validators: [{ operator_address: 'cosmosvaloper1', tokens: '100', delegator_shares: '200.0' }],
      delegations: [
        { delegator_address: 'cosmos1base', validator_address: 'cosmosvaloper1', shares: '50.0' },
        { delegator_address: 'cosmos1base', validator_address: 'cosmosvaloper1', shares: '25.0' },
      ],
    },
    genutil: { gen_txs: [] },
  },
});

const createCosmosProfile = (hashes: FixtureHashes, format: 'json' | 'gzip' = 'json'): GenesisProfile => ({
  chainName: 'cosmoshub',
  chainId: 'cosmoshub-4',
  initialHeight: BigInt(10),
  denom: 'uatom',
  fileFormat: format,
  archiveSha256: hashes.archiveSha256,
  jsonSha256: hashes.jsonSha256,
  sourceEnvName: 'COSMOSHUB_GENESIS_SOURCE',
  baselineSource: 'staking-state',
  compatibleCoverageHeights: [BigInt(10)],
  expectedCounts: { accounts: 2, validators: 1, delegations: 2, gentxs: 0, storedDelegations: 1 },
  expectedAccountTypes: {
    '/cosmos.auth.v1beta1.BaseAccount': 1,
    '/cosmos.vesting.v1beta1.DelayedVestingAccount': 1,
  },
});

const createAtomOneDocument = (): Record<string, unknown> => ({
  genesis_time: '2024-02-27T06:00:00.000Z',
  chain_id: 'atomone-1',
  initial_height: '1',
  app_state: {
    auth: { accounts: [{ '@type': '/cosmos.auth.v1beta1.BaseAccount', address: 'atone1base' }] },
    staking: { params: { bond_denom: 'uatone' }, validators: [], delegations: [] },
    genutil: {
      gen_txs: [
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.staking.v1beta1.MsgCreateValidator',
                delegator_address: 'atone1base',
                validator_address: 'atonevaloper1',
                value: { denom: 'uatone', amount: '10' },
              },
            ],
          },
        },
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.staking.v1beta1.MsgCreateValidator',
                delegator_address: 'atone1base',
                validator_address: 'atonevaloper1',
                value: { denom: 'uatone', amount: '5' },
              },
            ],
          },
        },
      ],
    },
  },
});

const createAtomOneProfile = (hashes: FixtureHashes): GenesisProfile => ({
  chainName: 'atomone',
  chainId: 'atomone-1',
  initialHeight: BigInt(1),
  denom: 'uatone',
  fileFormat: 'json',
  jsonSha256: hashes.jsonSha256,
  sourceEnvName: 'ATOMONE_GENESIS_SOURCE',
  baselineSource: 'gentx-create-validator',
  compatibleCoverageHeights: [BigInt(1)],
  expectedCounts: { accounts: 1, validators: 0, delegations: 0, gentxs: 2, storedDelegations: 1 },
  expectedAccountTypes: { '/cosmos.auth.v1beta1.BaseAccount': 1 },
});

const validateCosmosFixture = async (fixture: VerifiedFixture): Promise<GenesisValidationSummary> =>
  validateGenesisSource(fixture.file, fixture.profile);

test('fixed-point delegation math stays exact and rejects non-decimal input', () => {
  assert.deepEqual(parseUnsignedDecimal('123.4500', 'amount'), {
    numerator: BigInt('1234500'),
    scale: BigInt('10000'),
  });
  assert.equal(floorDelegationTokens('1.5', '100', '3.0'), BigInt(50));
  assert.throws(() => parseUnsignedDecimal('1e6', 'amount'), /unsigned fixed-point decimal/);
});

test('known account wrappers resolve their nested base-account address', () => {
  assert.equal(
    extractGenesisAccountAddress({
      '@type': '/cosmos.vesting.v1beta1.DelayedVestingAccount',
      base_vesting_account: { base_account: { address: 'cosmos1nested' } },
    }),
    'cosmos1nested',
  );
  assert.throws(
    () => extractGenesisAccountAddress({ '@type': '/custom.UnknownAccount', address: 'cosmos1unknown' }),
    /unsupported auth account wrapper/,
  );
});

test('Cosmos validation streams accounts and preserves exact validator attribution', async () => {
  const fixture = await createVerifiedFixture(createCosmosDocument(), 'json', createCosmosProfile);
  try {
    const summary = await validateCosmosFixture(fixture);
    assert.deepEqual(summary.counts, { accounts: 2, validators: 1, delegations: 2, gentxs: 0 });
    assert.deepEqual(summary.delegationRows, [
      {
        delegatorAddress: 'cosmos1base',
        validatorAddress: 'cosmosvaloper1',
        denom: 'uatom',
        amount: '37',
      },
    ]);
  } finally {
    await fixture.cleanup();
  }
});

test('Cosmos validation rejects an unknown delegation validator before persistence', async () => {
  const document = createCosmosDocument();
  const staking = (document.app_state as { staking: { delegations: Array<Record<string, unknown>> } }).staking;
  staking.delegations[0].validator_address = 'cosmosvaloper-missing';
  const fixture = await createVerifiedFixture(document, 'json', createCosmosProfile);
  try {
    await assert.rejects(validateCosmosFixture(fixture), /delegation references unknown validator/);
  } finally {
    await fixture.cleanup();
  }
});

test('semantic identity mismatches fail after hash verification and before persistence', async () => {
  const cases: Array<{
    expected: RegExp;
    mutate: (document: Record<string, unknown>) => void;
  }> = [
    {
      expected: /genesis chain_id mismatch/,
      mutate: (document) => {
        document.chain_id = 'unexpected-1';
      },
    },
    {
      expected: /genesis initial_height mismatch/,
      mutate: (document) => {
        document.initial_height = '11';
      },
    },
    {
      expected: /genesis staking denom mismatch/,
      mutate: (document) => {
        const staking = (document.app_state as { staking: { params: { bond_denom: string } } }).staking;
        staking.params.bond_denom = 'ubad';
      },
    },
    {
      expected: /unsupported auth account wrappers/,
      mutate: (document) => {
        const auth = (document.app_state as { auth: { accounts: Array<Record<string, unknown>> } }).auth;
        auth.accounts[0]['@type'] = '/custom.UnknownAccount';
      },
    },
  ];

  for (const testCase of cases) {
    const document = createCosmosDocument();
    testCase.mutate(document);
    const fixture = await createVerifiedFixture(document, 'json', createCosmosProfile);
    try {
      await assert.rejects(validateCosmosFixture(fixture), testCase.expected);
    } finally {
      await fixture.cleanup();
    }
  }
});

test('AtomOne validation aggregates duplicate create-validator gentxs without losing validator identity', async () => {
  const fixture = await createVerifiedFixture(createAtomOneDocument(), 'json', createAtomOneProfile);
  try {
    const summary = await validateGenesisSource(fixture.file, fixture.profile);
    assert.deepEqual(summary.counts, { accounts: 1, validators: 0, delegations: 0, gentxs: 2 });
    assert.deepEqual(summary.delegationRows, [
      {
        delegatorAddress: 'atone1base',
        validatorAddress: 'atonevaloper1',
        denom: 'uatone',
        amount: '15',
      },
    ]);
  } finally {
    await fixture.cleanup();
  }
});

test('gzip sources require both archive and decompressed JSON identity and detect later mutation', async () => {
  const fixture = await createVerifiedFixture(createCosmosDocument(), 'gzip', (hashes) =>
    createCosmosProfile(hashes, 'gzip'),
  );
  const copiedDirectory = fixture.file.directory;
  try {
    assert.equal(fixture.file.archiveSha256, fixture.profile.archiveSha256);
    assert.equal(fixture.file.jsonSha256, fixture.profile.jsonSha256);
    await writeFile(fixture.file.path, 'tampered');
    await assert.rejects(
      assertVerifiedGenesisSourceUnchanged(fixture.profile, fixture.file),
      /temp file changed before persistence/,
    );
  } finally {
    await fixture.cleanup();
  }
  await assert.rejects(stat(copiedDirectory), (error: NodeJS.ErrnoException) => error.code === 'ENOENT');
});

test('a wrong pinned hash is rejected before genesis parsing', async () => {
  const sourceDirectory = await mkdtemp(join(tmpdir(), 'validatorinfo-genesis-bad-hash-'));
  const sourcePath = join(sourceDirectory, 'genesis.json');
  await writeFile(sourcePath, JSON.stringify(createCosmosDocument()));
  try {
    const profile = createCosmosProfile({ jsonSha256: '0'.repeat(64) });
    await assert.rejects(fetchAndVerifyGenesisSource(profile, sourcePath), /genesis JSON SHA-256 mismatch/);
  } finally {
    await rm(sourceDirectory, { recursive: true, force: true });
  }
});

test('coverage validation accepts only the pinned API boundary', async () => {
  const profile = createCosmosProfile({ jsonSha256: '0'.repeat(64) });
  const validFetcher: typeof fetch = async () =>
    new Response(JSON.stringify({ data: { earliest_height: '10', earliest_time: '2020-01-01T00:00:01.000Z' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  const coverage = await fetchGenesisCoverage(profile, {
    baseUrl: 'https://indexer.invalid/',
    apiKey: 'test-key',
    fetcher: validFetcher,
  });
  assert.equal(coverage.earliestHeight, BigInt(10));
  assert.equal(coverage.earliestTime.toISOString(), '2020-01-01T00:00:01.000Z');

  const invalidFetcher: typeof fetch = async () =>
    new Response(JSON.stringify({ data: { earliest_height: '11', earliest_time: '2020-01-01T00:00:01Z' } }), {
      status: 200,
    });
  await assert.rejects(
    fetchGenesisCoverage(profile, {
      baseUrl: 'https://indexer.invalid',
      apiKey: 'test-key',
      fetcher: invalidFetcher,
    }),
    /coverage height 11 is incompatible/,
  );
});

const integrationDatabaseUrl = process.env.GENESIS_TEST_DATABASE_URL;

test(
  'interrupted persistence rebuilds, publishes ready, and then becomes a verified no-op',
  { skip: !integrationDatabaseUrl },
  async () => {
    assert.ok(integrationDatabaseUrl);
    const prisma = new PrismaClient({ datasources: { db: { url: integrationDatabaseUrl } } });
    const fixture = await createVerifiedFixture(createCosmosDocument(), 'json', createCosmosProfile);
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const ecosystemName = `genesis-test-${suffix}`;
    let chainId: number | null = null;

    try {
      await prisma.ecosystem.create({
        data: { name: ecosystemName, prettyName: ecosystemName, logoUrl: 'https://example.invalid/logo.svg' },
      });
      const chain = await prisma.chain.create({
        data: {
          ecosystem: ecosystemName,
          chainId: `genesis-test-chain-${suffix}`,
          rang: 1,
          name: `genesis-test-${suffix}`,
          prettyName: 'Genesis test',
          logoUrl: 'https://example.invalid/logo.svg',
          coinGeckoId: 'genesis-test',
          twitterUrl: 'https://example.invalid/twitter',
          githubUrl: 'https://example.invalid/github',
          githubMainRepo: 'genesis/test',
        },
      });
      chainId = chain.id;
      const summary = await validateCosmosFixture(fixture);
      const coverage = { earliestHeight: BigInt(10), earliestTime: new Date('2020-01-01T00:00:01.000Z') };
      const options = {
        prisma,
        chainDatabaseId: chain.id,
        profile: fixture.profile,
        file: fixture.file,
        summary,
        coverage,
        boundaryTime: coverage.earliestTime,
        meta: { test: true },
        batchSize: 1,
      };

      await assert.rejects(
        persistValidatedGenesis({
          ...options,
          onAccountBatch: async (persisted) => {
            if (persisted === 1) throw new Error('simulated interruption');
          },
        }),
        /simulated interruption/,
      );
      const interrupted = await prisma.genesisSnapshot.findUniqueOrThrow({ where: { chainId: chain.id } });
      assert.equal(interrupted.status, 'importing');
      assert.equal(await prisma.genesisAccount.count({ where: { snapshotId: interrupted.id } }), 1);

      const imported = await persistValidatedGenesis(options);
      assert.equal(imported.outcome, 'imported');
      const ready = await prisma.genesisSnapshot.findUniqueOrThrow({ where: { chainId: chain.id } });
      assert.equal(ready.status, 'ready');
      assert.equal(ready.accountCount, 2);
      assert.equal(ready.delegationCount, 1);
      const delegation = await prisma.genesisDelegation.findFirstOrThrow({ where: { snapshotId: ready.id } });
      assert.equal(delegation.validatorAddress, 'cosmosvaloper1');
      assert.equal(delegation.amount.toFixed(0), '37');

      const noOp = await persistValidatedGenesis(options);
      assert.deepEqual(noOp, { snapshotId: ready.id, outcome: 'ready-noop' });
      await assert.rejects(
        persistValidatedGenesis({
          ...options,
          coverage: { ...coverage, earliestHeight: BigInt(11) },
        }),
        /ready genesis snapshot identity differs/,
      );
    } finally {
      if (chainId !== null) await prisma.chain.delete({ where: { id: chainId } });
      await prisma.ecosystem.deleteMany({ where: { name: ecosystemName } });
      await prisma.$disconnect();
      await fixture.cleanup();
    }
  },
);

test(
  'the importer advisory lock is held by one dedicated PostgreSQL session',
  { skip: !integrationDatabaseUrl },
  async () => {
    assert.ok(integrationDatabaseUrl);
    const lockName = `validatorinfo-genesis-test-lock-${Date.now()}`;

    await withAdvisoryLock(
      { connectionString: integrationDatabaseUrl, lockName, applicationName: 'validatorinfo-genesis-lock-test' },
      async () => {
        const contender = new Client({ connectionString: integrationDatabaseUrl });
        await contender.connect();
        try {
          const result = await contender.query<{ acquired: boolean }>(
            'SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired',
            [lockName],
          );
          assert.equal(result.rows[0]?.acquired, false);
        } finally {
          await contender.end();
        }
      },
    );

    const contender = new Client({ connectionString: integrationDatabaseUrl });
    await contender.connect();
    try {
      const result = await contender.query<{ acquired: boolean }>(
        'SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired',
        [lockName],
      );
      assert.equal(result.rows[0]?.acquired, true);
      await contender.query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', [lockName]);
    } finally {
      await contender.end();
    }
  },
);
