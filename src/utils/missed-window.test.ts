import assert from 'node:assert/strict';
import test from 'node:test';

import { getMissedWindow, getMissedWindowMessage } from '@/utils/missed-window';

test('calculates second-based Cosmos signing windows in hours', () => {
  const cosmosHub = getMissedWindow({
    chainName: 'cosmoshub',
    blocksWindow: 10_000,
    totalSlots: null,
    avgTxInterval: 5.71,
  });
  const osmosis = getMissedWindow({
    chainName: 'osmosis',
    blocksWindow: 80_000,
    totalSlots: null,
    avgTxInterval: 1.19,
  });

  assert.deepEqual({ count: cosmosHub.count, usesSlots: cosmosHub.usesSlots }, { count: 10_000, usesSlots: false });
  assert.equal(cosmosHub.hours?.toFixed(1), '15.9');
  assert.equal(osmosis.hours?.toFixed(1), '26.4');
});

test('normalizes millisecond intervals only for Logos and Miden', () => {
  const logos = getMissedWindow({
    chainName: 'logos-testnet',
    blocksWindow: 10_000,
    totalSlots: null,
    avgTxInterval: 1_360,
  });
  const miden = getMissedWindow({
    chainName: 'miden-testnet',
    blocksWindow: 10_000,
    totalSlots: null,
    avgTxInterval: 3_000,
  });

  assert.equal(logos.hours?.toFixed(1), '3.8');
  assert.equal(miden.hours?.toFixed(1), '8.3');
});

test('prefers validator slot totals and preserves slot wording without a known interval', () => {
  const aztec = getMissedWindow({
    chainName: 'aztec',
    blocksWindow: 10_000,
    totalSlots: 1_000,
    avgTxInterval: 72,
  });
  const ethereum = getMissedWindow({
    chainName: 'ethereum',
    blocksWindow: null,
    totalSlots: 8_192,
    avgTxInterval: 0,
  });

  assert.deepEqual(aztec, { count: 1_000, usesSlots: true, hours: 20 });
  assert.deepEqual(ethereum, { count: 8_192, usesSlots: true, hours: null });
});

test('rejects missing or non-positive window sizes', () => {
  assert.deepEqual(
    getMissedWindow({ chainName: 'cosmoshub', blocksWindow: null, totalSlots: null, avgTxInterval: 5.71 }),
    { count: null, usesSlots: false, hours: null },
  );
  assert.deepEqual(getMissedWindow({ chainName: 'aztec', blocksWindow: 10_000, totalSlots: 0, avgTxInterval: 72 }), {
    count: null,
    usesSlots: true,
    hours: null,
  });
});

test('maps window data to one typed translation descriptor', () => {
  assert.deepEqual(getMissedWindowMessage({ count: 100, usesSlots: false, hours: 1.25 }), {
    key: 'missedWindowBlocks',
    values: { count: '100', hours: '1.3' },
  });
  assert.deepEqual(getMissedWindowMessage({ count: 100, usesSlots: true, hours: null }), {
    key: 'missedWindowSlotsNoTime',
    values: { count: '100' },
  });
  assert.equal(getMissedWindowMessage({ count: null, usesSlots: false, hours: null }), null);
});
