import assert from 'node:assert/strict';
import test from 'node:test';

import { formatXmrReward } from '@/utils/monero';

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
