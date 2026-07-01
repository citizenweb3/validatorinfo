const HASH_UNITS = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];

/**
 * Formats a hashrate (raw H/s as BigInt-string or number) into a human-readable string.
 * Stored as BigInt-as-string in DB; we parse with BigInt to avoid precision loss for >2^53 values.
 */
export const formatHashrate = (raw: string | number | null | undefined, fractionDigits: number = 2): string => {
  if (raw === null || raw === undefined || raw === '') return '-';

  let value: number;
  if (typeof raw === 'number') {
    value = raw;
  } else {
    try {
      // Parse via BigInt to handle very large numeric strings safely, then narrow.
      value = Number(BigInt(raw));
    } catch {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return '-';
      value = parsed;
    }
  }

  if (!Number.isFinite(value) || value <= 0) return '0 H/s';

  let unitIndex = 0;
  let scaled = value;
  while (scaled >= 1000 && unitIndex < HASH_UNITS.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }

  return `${scaled.toFixed(fractionDigits)} ${HASH_UNITS[unitIndex]}`;
};

/**
 * Returns just the numeric portion of a hashrate at its preferred unit.
 * Useful for chart Y-axis values where the unit is displayed in the axis label.
 */
export const scaleHashrateForChart = (
  raw: string | number,
): { value: number; unit: string } => {
  let value: number;
  if (typeof raw === 'number') {
    value = raw;
  } else {
    try {
      value = Number(BigInt(raw));
    } catch {
      value = Number(raw);
    }
  }
  if (!Number.isFinite(value) || value <= 0) return { value: 0, unit: 'H/s' };

  let unitIndex = 0;
  let scaled = value;
  while (scaled >= 1000 && unitIndex < HASH_UNITS.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }
  return { value: scaled, unit: HASH_UNITS[unitIndex] };
};
