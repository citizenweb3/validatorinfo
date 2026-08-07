import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildMiningCoreSnapshot,
  buildMiningEmissionContext,
  buildMiningNetworkFees,
  buildMiningPoolContext,
} from '@/utils/mining-economics-context';
import { formatXmrReward } from '@/utils/monero';
import { MONEY_SUPPLY_ATOMIC, TAIL_EMISSION_ATOMIC } from '@/utils/monero-emission';

test('typical transaction fees stay visible instead of collapsing to zero', () => {
  // 0.00003 XMR — below the old four-digit cut-off, which rendered "0.0000 XMR".
  assert.equal(formatXmrReward('30000000'), '0.00003 XMR');
  assert.equal(formatXmrReward('270000000'), '0.00027 XMR');
  assert.equal(formatXmrReward('300000000'), '0.0003 XMR');
});

test('block rewards keep two fraction digits', () => {
  assert.equal(formatXmrReward('600000000000'), '0.6 XMR');
  assert.equal(formatXmrReward('3250000000000'), '3.25 XMR');
  assert.equal(formatXmrReward('0'), '0 XMR');
});

test('missing or malformed atomic amounts render as a dash', () => {
  assert.equal(formatXmrReward(null), '-');
  assert.equal(formatXmrReward(undefined), '-');
  assert.equal(formatXmrReward(''), '-');
  assert.equal(formatXmrReward('not-a-number'), '-');
});

test('uses the requested locale for separators', () => {
  assert.equal(formatXmrReward('3250000000000', 'de-DE'), '3,25 XMR');
});

test('keeps transaction activity when fee counters cannot produce a fee', () => {
  const fees = buildMiningNetworkFees(
    {
      feeBlockCount: 0,
      feeTxCount: 0,
      sumRewardAtomic: 'not-an-atomic-amount',
      totalTx: 42,
    },
    null,
  );

  assert.deepEqual(fees, {
    averageFeeAtomic: null,
    feeShare: null,
    transactionsPerDay: 42,
  });
});

test('uses the permanent tail subsidy fallback for fee composition', () => {
  const fees = buildMiningNetworkFees(
    {
      feeBlockCount: 2,
      feeTxCount: 10,
      sumRewardAtomic: '1300000000000',
      totalTx: 10,
    },
    null,
  );

  assert.equal(fees?.averageFeeAtomic, '10000000000');
  assert.ok(fees?.feeShare !== null && Math.abs(fees.feeShare - 1 / 13) < 1e-12);
  assert.equal(fees?.transactionsPerDay, 10);
});

test('clamps emission headroom at zero once tail emission is reached', () => {
  const emission = buildMiningEmissionContext(MONEY_SUPPLY_ATOMIC.toString());

  assert.ok(emission);
  assert.equal(emission.blockRewardAtomic, TAIL_EMISSION_ATOMIC.toString());
  assert.equal(emission.tailEmissionReached, true);
  assert.equal(emission.tailHeadroomAtomic, '0');
});

test('sorts and caps top pools while dropping a malformed hashrate row', () => {
  const poolStats = [
    { name: 'One', sharePercent: 1, hashrateEstimate: '1000' },
    { name: 'Eight', sharePercent: 8, hashrateEstimate: '8000' },
    { name: 'Bad', sharePercent: 100, hashrateEstimate: 'malformed' },
    { name: 'Six', sharePercent: 6, hashrateEstimate: '6000' },
    { name: 'Three', sharePercent: 3, hashrateEstimate: '3000' },
    { name: 'Seven', sharePercent: 7, hashrateEstimate: '7000' },
    { name: 'Five', sharePercent: 5, hashrateEstimate: '5000' },
    { name: 'Four', sharePercent: 4, hashrateEstimate: '4000' },
  ].map(({ hashrateEstimate, name, sharePercent }) => ({
    hashrateEstimate,
    pool: {
      feePercent: 1,
      isVerified: true,
      name,
      slug: name.toLowerCase(),
    },
    sharePercent,
  }));

  const context = buildMiningPoolContext(poolStats);

  assert.deepEqual(
    context.topPools.map((pool) => pool.name),
    ['Eight', 'Seven', 'Six', 'Five', 'Four'],
  );
  assert.equal(context.topPools.length, 5);
});

test('keeps core mining economics when optional context sources are absent', () => {
  const core = buildMiningCoreSnapshot({
    averageRewardAtomic: TAIL_EMISSION_ATOMIC.toString(),
    coinDecimals: 12,
    networkSnapshot: { difficulty: '1000000', hashrate: '1000' },
    poolStats: null,
    tokenPriceUsd: 100,
    tokenSymbol: 'XMR',
  });

  assert.ok(core);
  assert.equal(core.weightedPoolFeePercent, null);
  assert.deepEqual(core.poolFees, []);
  assert.deepEqual(core.topPools, []);
  assert.equal(buildMiningNetworkFees(null, null), null);
  assert.equal(buildMiningEmissionContext(null), null);
});
