const UNSIGNED_DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/;

type DecimalParts = {
  whole: string;
  fraction: string;
};

const parseUnsignedDecimalParts = (value: string): DecimalParts => {
  if (!UNSIGNED_DECIMAL_PATTERN.test(value)) {
    throw new Error(`invalid unsigned decimal string: ${value}`);
  }

  const [rawWhole, fraction = ''] = value.split('.');
  const whole = rawWhole.replace(/^0+(?=\d)/, '') || '0';
  return { whole, fraction };
};

export const normalizeUnsignedDecimal = (value: string): string => {
  const { whole, fraction } = parseUnsignedDecimalParts(value);
  const trimmedFraction = fraction.replace(/0+$/, '');
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
};

export const normalizeUnsignedInteger = (value: string): string => {
  const { whole, fraction } = parseUnsignedDecimalParts(value);
  if (fraction && !/^0+$/.test(fraction)) {
    throw new Error(`unsigned integer cannot contain fractional units: ${value}`);
  }
  return whole;
};

export const floorUnsignedDecimal = (value: string): string => parseUnsignedDecimalParts(value).whole;

export const addUnsignedDecimalStrings = (left: string, right: string): string => {
  const leftParts = parseUnsignedDecimalParts(left);
  const rightParts = parseUnsignedDecimalParts(right);
  const scale = Math.max(leftParts.fraction.length, rightParts.fraction.length);
  const leftInteger = BigInt(`${leftParts.whole}${leftParts.fraction.padEnd(scale, '0')}`);
  const rightInteger = BigInt(`${rightParts.whole}${rightParts.fraction.padEnd(scale, '0')}`);
  const sum = (leftInteger + rightInteger).toString().padStart(scale + 1, '0');

  if (scale === 0) return sum;
  return normalizeUnsignedDecimal(`${sum.slice(0, -scale)}.${sum.slice(-scale)}`);
};

export const compareUnsignedDecimalStrings = (left: string, right: string): number => {
  const leftParts = parseUnsignedDecimalParts(left);
  const rightParts = parseUnsignedDecimalParts(right);
  const scale = Math.max(leftParts.fraction.length, rightParts.fraction.length);
  const leftInteger = BigInt(`${leftParts.whole}${leftParts.fraction.padEnd(scale, '0')}`);
  const rightInteger = BigInt(`${rightParts.whole}${rightParts.fraction.padEnd(scale, '0')}`);

  if (leftInteger === rightInteger) return 0;
  return leftInteger > rightInteger ? 1 : -1;
};

export const formatBaseUnits = (value: string, coinDecimals: number): string => {
  if (!Number.isInteger(coinDecimals) || coinDecimals < 0 || coinDecimals > 255) {
    throw new Error(`coin decimals must be an integer between 0 and 255: ${coinDecimals}`);
  }

  const { whole, fraction } = parseUnsignedDecimalParts(value);
  const digits = `${whole}${fraction}`.replace(/^0+(?=\d)/, '') || '0';
  const scale = coinDecimals + fraction.length;
  if (scale === 0) return digits;

  const padded = digits.padStart(scale + 1, '0');
  return normalizeUnsignedDecimal(`${padded.slice(0, -scale)}.${padded.slice(-scale)}`);
};

export const formatDecimalForDisplay = (value: string, fractionDigits: number = 6): string => {
  if (!Number.isInteger(fractionDigits) || fractionDigits < 0 || fractionDigits > 100) {
    throw new Error(`fraction digits must be an integer between 0 and 100: ${fractionDigits}`);
  }

  const { whole, fraction } = parseUnsignedDecimalParts(value);
  if (fractionDigits === 0) return whole;
  return `${whole}.${fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0')}`;
};
