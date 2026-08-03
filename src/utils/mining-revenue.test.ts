import assert from 'node:assert/strict';
import test from 'node:test';

import { buildMiningNetworkTrend, selectMiningTrendWindow } from '@/utils/mining-network-trend';
import {
  breakEvenDifficulty,
  breakEvenTokenPrice,
  estimateElectricityCostPerDay,
  estimateHardwarePaybackDays,
  estimateMiningReturn,
  estimateTrendAdjustedPayback,
  growthRatePerDay,
  weightedAverageFeePercent,
} from '@/utils/mining-revenue';

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

test('estimates electricity cost only from complete valid user inputs', () => {
  const fullTime = estimateElectricityCostPerDay(100, 0.2);
  const halfTime = estimateElectricityCostPerDay(100, 0.2, 0.5);
  assert.ok(fullTime !== null);
  assert.ok(halfTime !== null);
  assertClose(fullTime, 0.48);
  assertClose(halfTime, 0.24);
  assert.equal(estimateElectricityCostPerDay(0, 0.2), null);
  assert.equal(estimateElectricityCostPerDay(100, -1), null);
});

test('estimates hardware payback only for positive daily profit', () => {
  assert.equal(estimateHardwarePaybackDays(1_000, 5), 200);
  assert.equal(estimateHardwarePaybackDays(1_000, 0), null);
  assert.equal(estimateHardwarePaybackDays(1_000, -5), null);
});

test('calculates signed daily growth from numeric and bigint series', () => {
  const numericGrowth = growthRatePerDay(100, 121, 2);
  const bigintGrowth = growthRatePerDay(BigInt(100), BigInt(121), 2);

  assert.ok(numericGrowth !== null);
  assert.ok(bigintGrowth !== null);
  assert.ok(Math.abs(numericGrowth - 0.1) < 1e-12);
  assert.ok(Math.abs(bigintGrowth - 0.1) < 1e-12);
  assert.ok((growthRatePerDay(121, 100, 2) ?? 0) < 0);
  assert.equal(growthRatePerDay(0, 100, 2), null);
  assert.equal(growthRatePerDay(BigInt(-1), BigInt(100), 2), null);
  assert.equal(growthRatePerDay(100, 121, 0), null);
});

test('makes trend-adjusted payback longer when difficulty grows', () => {
  const naivePaybackDays = estimateHardwarePaybackDays(100, 10);
  const trendPayback = estimateTrendAdjustedPayback({
    difficultyGrowthRatePerDay: 0.01,
    electricityCostUsdPerDay: 10,
    hardwareCostUsd: 100,
    revenueUsdPerDay: 20,
  });

  assert.ok(naivePaybackDays !== null);
  assert.deepEqual(trendPayback?.status, 'paid-back');
  assert.ok(trendPayback?.status === 'paid-back' && trendPayback.days > naivePaybackDays);
});

test('matches naive payback when difficulty is flat', () => {
  const trendPayback = estimateTrendAdjustedPayback({
    difficultyGrowthRatePerDay: 0,
    electricityCostUsdPerDay: 10,
    hardwareCostUsd: 100,
    revenueUsdPerDay: 20,
  });

  assert.deepEqual(trendPayback, { days: 10, status: 'paid-back' });
});

test('reports when decaying revenue never repays the hardware', () => {
  const trendPayback = estimateTrendAdjustedPayback({
    difficultyGrowthRatePerDay: 0.01,
    electricityCostUsdPerDay: 6,
    hardwareCostUsd: 100,
    revenueUsdPerDay: 5,
  });

  assert.deepEqual(trendPayback, { status: 'never' });
});

test('allows falling difficulty to shorten payback', () => {
  const naivePaybackDays = estimateHardwarePaybackDays(105, 10);
  const trendPayback = estimateTrendAdjustedPayback({
    difficultyGrowthRatePerDay: -0.01,
    electricityCostUsdPerDay: 10,
    hardwareCostUsd: 105,
    revenueUsdPerDay: 20,
  });

  assert.ok(naivePaybackDays !== null);
  assert.ok(trendPayback?.status === 'paid-back');
  assert.ok(trendPayback.days < Math.ceil(naivePaybackDays));
});

test('rejects invalid trend-adjusted payback inputs', () => {
  assert.equal(
    estimateTrendAdjustedPayback({
      difficultyGrowthRatePerDay: -1,
      electricityCostUsdPerDay: 1,
      hardwareCostUsd: 100,
      revenueUsdPerDay: 10,
    }),
    null,
  );
});

test('calculates break-even token price and difficulty', () => {
  const tokenPrice = breakEvenTokenPrice(0.01, 0.5);
  const difficulty = breakEvenDifficulty(BigInt(600_000_000_000), 2, 0.5);

  assert.equal(tokenPrice, 50);
  assert.equal((tokenPrice ?? 0) * 0.01 - 0.5, 0);
  assert.equal(difficulty, BigInt(2_400_000_000_000));
  assert.equal(breakEvenTokenPrice(0, 0.5), null);
  assert.equal(breakEvenDifficulty(BigInt(600_000_000_000), 2, 0), null);
});

test('selects the longest supported hashrate trend window', () => {
  const referenceAt = new Date('2026-08-03T12:00:00.000Z');

  assert.equal(selectMiningTrendWindow(new Date('2026-07-03T12:00:00.000Z'), referenceAt), 30);
  assert.equal(selectMiningTrendWindow(new Date('2026-07-26T12:00:00.000Z'), referenceAt), 7);
  assert.equal(selectMiningTrendWindow(new Date('2026-07-28T12:00:00.000Z'), referenceAt), null);
  assert.equal(selectMiningTrendWindow(null, referenceAt), null);
});

test('builds a signed network trend from aligned history', () => {
  const referenceAt = new Date('2026-08-03T12:00:00.000Z');
  const trend = buildMiningNetworkTrend({
    priceHistory: [
      { date: '2026-07-04', value: 100 },
      { date: '2026-08-03', value: 80 },
    ],
    referenceAt,
    snapshots: [
      {
        difficulty: '100',
        hashrate: '1000',
        height: 1_000_000,
        snapshotAt: new Date('2026-07-04T12:00:00.000Z'),
      },
      {
        difficulty: '121',
        hashrate: '1100',
        height: 1_021_600,
        snapshotAt: referenceAt,
      },
    ],
    windowDays: 30,
  });

  assert.ok(trend);
  assert.equal(trend.windowDays, 30);
  assert.equal(trend.currentDifficulty, '121');
  assert.equal(trend.currentHashrateHps, 1100);
  assert.ok(Math.abs(trend.difficultyChange - 0.21) < 1e-12);
  assert.ok(Math.abs(trend.hashrateChange - 0.1) < 1e-12);
  assert.ok(Math.abs(trend.priceChange + 0.2) < 1e-12);
  assert.ok(Math.abs(trend.blocksPerHour - 30) < 1e-12);
});

test('omits a network trend when history endpoints or prices are incomplete', () => {
  const referenceAt = new Date('2026-08-03T12:00:00.000Z');
  const staleSnapshots = [
    {
      difficulty: '100',
      hashrate: '1000',
      height: 1_000_000,
      snapshotAt: new Date('2026-07-27T15:00:00.000Z'),
    },
    {
      difficulty: '110',
      hashrate: '1100',
      height: 1_005_040,
      snapshotAt: referenceAt,
    },
  ];

  assert.equal(
    buildMiningNetworkTrend({
      priceHistory: [
        { date: '2026-07-27', value: 100 },
        { date: '2026-08-03', value: 110 },
      ],
      referenceAt,
      snapshots: staleSnapshots,
      windowDays: 7,
    }),
    null,
  );

  assert.equal(
    buildMiningNetworkTrend({
      priceHistory: [{ date: '2026-07-27', value: 100 }],
      referenceAt,
      snapshots: [{ ...staleSnapshots[0], snapshotAt: new Date('2026-07-27T12:00:00.000Z') }, staleSnapshots[1]],
      windowDays: 7,
    }),
    null,
  );
});
