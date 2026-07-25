import assert from 'node:assert/strict';
import test from 'node:test';

import { getPoolRegistry } from '@/server/tools/chains/monero/pool-client';

test('curated Monero pool configurations stay complete and source-backed', () => {
  const registry = getPoolRegistry();

  assert.deepEqual(registry.map((pool) => pool.key).sort(), [
    'c3pool',
    'hashvault',
    'herominers',
    'moneroocean',
    'nanopool',
    'p2pool',
    'supportxmr',
  ]);

  for (const pool of registry) {
    const { configuration } = pool;
    assert.match(configuration.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(configuration.sourceUrls.length > 0);
    assert.ok(configuration.sourceUrls.every((sourceUrl) => sourceUrl.startsWith('https://')));
    assert.ok(configuration.stratumEndpoints.length > 0);

    for (const endpoint of configuration.stratumEndpoints) {
      assert.ok(endpoint.host.length > 0);
      assert.ok(endpoint.ports.length > 0);
      assert.ok(endpoint.ports.every(({ port }) => Number.isInteger(port) && port > 0 && port <= 65_535));
    }
  }
});

test('unpublished pool properties remain explicit nulls', () => {
  const registry = getPoolRegistry();
  const heroMiners = registry.find((pool) => pool.key === 'herominers');
  const nanopool = registry.find((pool) => pool.key === 'nanopool');

  assert.equal(heroMiners?.configuration.software, null);
  assert.equal(heroMiners?.configuration.payoutFee, null);
  assert.equal(nanopool?.configuration.payoutSchedule, null);
  assert.equal(nanopool?.configuration.payoutFee, null);
});
