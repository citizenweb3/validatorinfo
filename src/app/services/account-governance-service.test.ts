import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const moduleUrl = (relativePath: string): string => pathToFileURL(path.resolve(relativePath)).href;

test('account governance service batches enrichment, deduplicates in-flight loads, and does not cache errors', async (context) => {
  type ModuleMockTracker = typeof context.mock & {
    module: (
      specifier: string,
      options: { defaultExport?: unknown; namedExports?: Record<string, unknown> },
    ) => unknown;
  };

  let releaseIndexer: (() => void) | undefined;
  let shouldFail = false;
  let indexerCalls = 0;
  let proposalCalls = 0;
  let countCalls = 0;
  let stakeCalls = 0;
  const cacheKeys: string[] = [];

  const indexerGate = new Promise<void>((resolve) => {
    releaseIndexer = resolve;
  });
  const client = {
    getGovVotes: async () => {
      indexerCalls += 1;
      await indexerGate;
      if (shouldFail) throw new Error('indexer unavailable');
      return {
        data: [
          {
            proposal_id: '7',
            option: 'YES' as const,
            weight: '1.000000000000000000',
            height: '10',
            tx_hash: 'ABC',
          },
        ],
        cursor: null,
        has_more: false,
        total: '1',
      };
    },
  };
  const dbStub = {
    proposal: {
      findMany: async () => {
        proposalCalls += 1;
        return [
          {
            proposalId: '7',
            title: 'Upgrade',
            status: 'PROPOSAL_STATUS_PASSED',
            finalTallyResult: JSON.stringify({
              yes_count: '10000',
              no_count: '0',
              abstain_count: '0',
            }),
          },
        ];
      },
      count: async () => {
        countCalls += 1;
        return 8;
      },
    },
  };
  const delegatedStakeStub = {
    getDelegatedStakeAtHeights: async () => {
      stakeCalls += 1;
      return {
        values: [{ height: '10', amounts: { uatom: '5' } }],
        meta: {},
      };
    },
  };
  const cacheGetOrFetch = async <T>(key: string, fetchFn: () => Promise<T | null>): Promise<T | null> => {
    cacheKeys.push(key);
    return fetchFn();
  };

  const mocks = context.mock as ModuleMockTracker;
  mocks.module(moduleUrl('src/db.ts'), { defaultExport: dbStub });
  mocks.module(moduleUrl('src/app/services/account-indexer-facts.ts'), {
    namedExports: { getAccountIndexerFactsClient: () => client },
  });
  mocks.module(moduleUrl('src/app/services/chain-service.ts'), {
    namedExports: {
      getChainLcdContext: async () => ({
        id: 1,
        coinDecimals: 6,
        denom: 'ATOM',
        minimalDenom: 'uatom',
        bech32Prefix: 'cosmos',
      }),
    },
  });
  mocks.module(moduleUrl('src/app/services/delegated-stake-service.ts'), {
    defaultExport: delegatedStakeStub,
  });
  mocks.module(moduleUrl('src/app/services/redis-cache.ts'), {
    namedExports: {
      CACHE_KEYS: {
        account: {
          govVotes: (chainName: string, address: string, cursor: string) =>
            `acct:govvotes:${chainName}:${address}:${cursor}`,
        },
      },
      CACHE_TTL: { MEDIUM: 300 },
      cacheGetOrFetch,
    },
  });
  mocks.module(moduleUrl('src/utils/bech32-address.ts'), {
    namedExports: { normalizeBech32Address: (address: string) => address.toLowerCase() },
  });

  const { getAccountVotingHistory } = await import('@/services/account-governance-service');
  const first = getAccountVotingHistory('cosmoshub', 'COSMOS1ADDRESS');
  const duplicate = getAccountVotingHistory('cosmoshub', 'COSMOS1ADDRESS');
  await Promise.resolve();
  assert.equal(indexerCalls, 1);

  releaseIndexer?.();
  const [firstResult, duplicateResult] = await Promise.all([first, duplicate]);
  assert.deepEqual(firstResult, duplicateResult);
  assert.equal(firstResult.status, 'ready');
  if (firstResult.status === 'ready') {
    assert.equal(firstResult.rows[0]?.impactBasisPoints, '5');
    assert.equal(firstResult.totalClosedProposals, 8);
  }
  assert.equal(proposalCalls, 1);
  assert.equal(countCalls, 1);
  assert.equal(stakeCalls, 1);
  assert.deepEqual(cacheKeys, ['acct:govvotes:cosmoshub:cosmos1address:head']);

  shouldFail = true;
  assert.deepEqual(await getAccountVotingHistory('cosmoshub', 'COSMOS1FAIL', '6'), { status: 'error' });
  assert.deepEqual(await getAccountVotingHistory('cosmoshub', 'COSMOS1FAIL', '6'), { status: 'error' });
  assert.equal(indexerCalls, 3);
  assert.deepEqual(cacheKeys.slice(-2), [
    'acct:govvotes:cosmoshub:cosmos1fail:6',
    'acct:govvotes:cosmoshub:cosmos1fail:6',
  ]);
});
