import assert from 'node:assert/strict';
import test from 'node:test';

import { estimateMiningReturn, weightedAverageFeePercent } from '@/utils/mining-revenue';

const assertClose = (actual: number, expected: number): void => {
  assert.ok(Math.abs(actual - expected) < Number.EPSILON);
};

test('estimates daily mining return after a percentage pool fee', () => {
  const estimate = estimateMiningReturn({
    averageReward: 0.6,
    blockTimeSeconds: 120,
    minerHashrateHps: 1_000,
    networkHashrateHps: 1_000_000_000,
    poolFeePercent: 1,
    tokenPriceUsd: 100,
  });

  assert.ok(estimate);
  assertClose(estimate.grossTokenPerDay, 0.000432);
  assertClose(estimate.poolFeeTokenPerDay, 0.00000432);
  assertClose(estimate.netTokenPerDay, 0.00042768);
  assertClose(estimate.netUsdPerDay, 0.042768);
});

test('applies an explicit uptime ratio', () => {
  const fullTime = estimateMiningReturn({
    averageReward: 0.6,
    blockTimeSeconds: 120,
    minerHashrateHps: 1_000,
    networkHashrateHps: 1_000_000_000,
    poolFeePercent: 0,
    tokenPriceUsd: 100,
  });
  const halfTime = estimateMiningReturn({
    averageReward: 0.6,
    blockTimeSeconds: 120,
    minerHashrateHps: 1_000,
    networkHashrateHps: 1_000_000_000,
    poolFeePercent: 0,
    tokenPriceUsd: 100,
    uptimeRatio: 0.5,
  });

  assert.ok(fullTime);
  assert.ok(halfTime);
  assert.equal(halfTime.netUsdPerDay, fullTime.netUsdPerDay / 2);
});

test('rejects invalid or incomplete profitability inputs', () => {
  assert.equal(
    estimateMiningReturn({
      averageReward: 0.6,
      blockTimeSeconds: 120,
      minerHashrateHps: 1_000,
      networkHashrateHps: 0,
      poolFeePercent: 1,
      tokenPriceUsd: 100,
    }),
    null,
  );
});

test('weights known pool fees by active hashrate', () => {
  const average = weightedAverageFeePercent([
    { feePercent: 1, hashrateHps: 3_000 },
    { feePercent: 0, hashrateHps: 1_000 },
    { feePercent: null, hashrateHps: 10_000 },
    { feePercent: 5, hashrateHps: 0 },
  ]);

  assert.equal(average, 0.75);
});
