import { parseUnsignedDecimalParts } from '@/utils/decimal-string';
import { getAllowedTxMessageTypes } from '@/utils/tx-message-types';

const MESSAGE_TYPE_PATTERN = /^\/[A-Za-z0-9._]{1,200}$/;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const UNSIGNED_INTEGER_PATTERN = /^\d+$/;
const MAX_AMOUNT_DIGITS = 80;
const MAX_MESSAGE_TYPES = 5;

export type TxFilters = Readonly<{
  msgTypes: readonly string[];
  fromTime: string | null;
  toTime: string | null;
  minAmount: string | null;
  maxAmount: string | null;
}>;

export type TxFiltersInput = Readonly<{
  mt: readonly string[];
  from: string | null;
  to: string | null;
  min: string | null;
  max: string | null;
}>;

export type TxFilterSearchParams =
  | Record<string, string | string[] | undefined>
  | Pick<URLSearchParams, 'get' | 'getAll'>;

export type TxApiFilterParams = {
  msg_type?: string;
  from_time?: string;
  to_time?: string;
  min_amount?: string;
  max_amount?: string;
  amount_denom?: string;
};

const EMPTY_MESSAGE_TYPES: readonly string[] = Object.freeze([]);

export const EMPTY_TX_FILTERS: TxFilters = Object.freeze({
  msgTypes: EMPTY_MESSAGE_TYPES,
  fromTime: null,
  toTime: null,
  minAmount: null,
  maxAmount: null,
});

const makeTxFilters = (filters: Omit<TxFilters, 'msgTypes'> & { msgTypes: string[] }): TxFilters => {
  const normalized = Object.freeze({ ...filters, msgTypes: Object.freeze(filters.msgTypes) });
  return hasActiveTxFilters(normalized) ? normalized : EMPTY_TX_FILTERS;
};

const isUrlSearchParams = (params: TxFilterSearchParams): params is Pick<URLSearchParams, 'get' | 'getAll'> =>
  'getAll' in params && typeof params.getAll === 'function';

const getRepeatedParam = (params: TxFilterSearchParams, key: string): string[] => {
  if (isUrlSearchParams(params)) return params.getAll(key);
  const value = params[key];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' ? [value] : [];
};

const getSingleParam = (params: TxFilterSearchParams, key: string): string | null => {
  if (isUrlSearchParams(params)) return params.get(key);
  const value = params[key];
  return typeof value === 'string' ? value : null;
};

const parseDateOnly = (value: string | null, endOfDay: boolean): string | null => {
  if (!value) return null;
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;

  return endOfDay ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`;
};

const parseUnsignedInteger = (value: string | null): string | null => {
  if (!value || value.length > MAX_AMOUNT_DIGITS || !UNSIGNED_INTEGER_PATTERN.test(value)) return null;
  return value.replace(/^0+(?=\d)/, '');
};

const compareUnsignedIntegers = (left: string, right: string): number => {
  if (left.length !== right.length) return left.length - right.length;
  return left.localeCompare(right);
};

export const formatLocalDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isTxAmountRangeValid = (minAmount: string | null, maxAmount: string | null): boolean =>
  !minAmount || !maxAmount || compareUnsignedIntegers(minAmount, maxAmount) <= 0;

export const parseTxFiltersFromSearchParams = (params: TxFilterSearchParams, chainName: string): TxFilters => {
  const allowedMessageTypes = getAllowedTxMessageTypes(chainName);
  const msgTypes = Array.from(
    new Set(
      getRepeatedParam(params, 'mt').filter(
        (typeUrl) => MESSAGE_TYPE_PATTERN.test(typeUrl) && allowedMessageTypes.has(typeUrl),
      ),
    ),
  )
    .sort()
    .slice(0, MAX_MESSAGE_TYPES);

  let fromTime = parseDateOnly(getSingleParam(params, 'from'), false);
  let toTime = parseDateOnly(getSingleParam(params, 'to'), true);
  if (fromTime && toTime && fromTime > toTime) {
    fromTime = null;
    toTime = null;
  }

  let minAmount = parseUnsignedInteger(getSingleParam(params, 'min'));
  let maxAmount = parseUnsignedInteger(getSingleParam(params, 'max'));
  if (minAmount && maxAmount && compareUnsignedIntegers(minAmount, maxAmount) > 0) {
    minAmount = null;
    maxAmount = null;
  }

  return makeTxFilters({ msgTypes, fromTime, toTime, minAmount, maxAmount });
};

export const hasActiveTxFilters = (filters: TxFilters): boolean =>
  filters.msgTypes.length > 0 ||
  filters.fromTime !== null ||
  filters.toTime !== null ||
  filters.minAmount !== null ||
  filters.maxAmount !== null;

export const hasAmountTxFilters = (filters: TxFilters): boolean =>
  filters.minAmount !== null || filters.maxAmount !== null;

export const txFiltersToInput = (filters: TxFilters): TxFiltersInput => ({
  mt: [...filters.msgTypes],
  from: filters.fromTime?.slice(0, 10) ?? null,
  to: filters.toTime?.slice(0, 10) ?? null,
  min: filters.minAmount,
  max: filters.maxAmount,
});

const isNullableString = (value: unknown): value is string | null => value === null || typeof value === 'string';

export const parseCanonicalTxFiltersInput = (value: unknown, chainName: string): TxFilters | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !['mt', 'from', 'to', 'min', 'max'].includes(key))) return null;
  if (!Array.isArray(input.mt) || !input.mt.every((item) => typeof item === 'string')) return null;
  if (!isNullableString(input.from) || !isNullableString(input.to)) return null;
  if (!isNullableString(input.min) || !isNullableString(input.max)) return null;

  const parsed = parseTxFiltersFromSearchParams(
    {
      mt: input.mt,
      from: input.from ?? undefined,
      to: input.to ?? undefined,
      min: input.min ?? undefined,
      max: input.max ?? undefined,
    },
    chainName,
  );
  const canonical = txFiltersToInput(parsed);
  const candidate: TxFiltersInput = {
    mt: input.mt,
    from: input.from,
    to: input.to,
    min: input.min,
    max: input.max,
  };

  return JSON.stringify(candidate) === JSON.stringify(canonical) ? parsed : null;
};

export const canonicalTxFilterKey = (filters: TxFilters): string => {
  if (!hasActiveTxFilters(filters)) return '';
  return [
    filters.msgTypes.length ? `mt:${filters.msgTypes.join(',')}` : null,
    filters.fromTime ? `ft:${filters.fromTime}` : null,
    filters.toTime ? `tt:${filters.toTime}` : null,
    filters.minAmount ? `min:${filters.minAmount}` : null,
    filters.maxAmount ? `max:${filters.maxAmount}` : null,
  ]
    .filter((segment): segment is string => segment !== null)
    .join('|');
};

export const txFiltersToApiParams = (filters: TxFilters, minimalDenom?: string): TxApiFilterParams => {
  if (hasAmountTxFilters(filters) && !minimalDenom) {
    throw new Error('minimal denom is required for amount filters');
  }

  return {
    msg_type: filters.msgTypes.length ? filters.msgTypes.join(',') : undefined,
    from_time: filters.fromTime ?? undefined,
    to_time: filters.toTime ?? undefined,
    min_amount: filters.minAmount ?? undefined,
    max_amount: filters.maxAmount ?? undefined,
    amount_denom: hasAmountTxFilters(filters) ? minimalDenom : undefined,
  };
};

export const displayAmountToBaseUnits = (input: string, coinDecimals: number): string | null => {
  if (!Number.isInteger(coinDecimals) || coinDecimals < 0 || coinDecimals > 255) return null;

  try {
    const { whole, fraction } = parseUnsignedDecimalParts(input.trim());
    if (fraction.length > coinDecimals) return null;
    const baseUnits = `${whole}${fraction.padEnd(coinDecimals, '0')}`.replace(/^0+(?=\d)/, '') || '0';
    return baseUnits.length <= MAX_AMOUNT_DIGITS ? baseUnits : null;
  } catch {
    return null;
  }
};
