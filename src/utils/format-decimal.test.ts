import assert from 'node:assert/strict';
import test from 'node:test';

import { formatDecimal } from '@/utils/format-decimal';

test('formats regular token amounts with at most two fraction digits', () => {
  assert.equal(formatDecimal(1_234.5678), '1,234.57');
  assert.equal(formatDecimal(12.5), '12.5');
  assert.equal(formatDecimal(0.01), '0.01');
  assert.equal(formatDecimal(0), '0');
  assert.equal(formatDecimal(-0), '0');
});

test('keeps two significant digits for small non-zero token amounts', () => {
  assert.equal(formatDecimal(0.00999), '0.01');
  assert.equal(formatDecimal(0.0000342), '0.000034');
  assert.equal(formatDecimal(-0.0000342), '-0.000034');
  assert.equal(formatDecimal(1e-21), '0.000000000000000000001');
});

test('uses the requested locale for separators', () => {
  assert.equal(formatDecimal(1_234.5678, 'de-DE'), '1.234,57');
  assert.equal(formatDecimal(0.0000342, 'de-DE'), '0,000034');
});
