const SMALL_VALUE_THRESHOLD = 0.01;
const MIN_DISPLAYED_CURRENCY_VALUE = 0.01;

const currencyFormatters = new Map<string, Intl.NumberFormat>();

const getCurrencyFormatter = (locale: string, currency: string): Intl.NumberFormat => {
  const cacheKey = `${locale}:${currency}`;
  const cached = currencyFormatters.get(cacheKey);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  currencyFormatters.set(cacheKey, formatter);

  return formatter;
};

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

/**
 * Formats a currency amount with two fraction digits, reporting sub-cent values
 * as a bound instead of rounding them down to zero.
 */
export const formatCurrencyDecimal = (value: number, locale: string = 'en-US', currency: string = 'USD'): string => {
  const formatter = getCurrencyFormatter(locale, currency);

  if (value !== 0 && Math.abs(value) < MIN_DISPLAYED_CURRENCY_VALUE) {
    const bound = formatter.format(MIN_DISPLAYED_CURRENCY_VALUE);
    return value < 0 ? `>-${bound}` : `<${bound}`;
  }

  return formatter.format(value);
};
