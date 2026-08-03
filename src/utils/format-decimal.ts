const SMALL_VALUE_THRESHOLD = 0.01;

/**
 * Formats numeric token amounts without long decimal tails while preserving
 * meaningful precision for small non-zero values.
 */
export const formatDecimal = (value: number, locale: string = 'en-US'): string => {
  const normalizedValue = Object.is(value, -0) ? 0 : value;
  const absoluteValue = Math.abs(normalizedValue);

  if (absoluteValue > 0 && absoluteValue < SMALL_VALUE_THRESHOLD) {
    return normalizedValue.toLocaleString(locale, { maximumSignificantDigits: 2 });
  }

  return normalizedValue.toLocaleString(locale, { maximumFractionDigits: 2 });
};
