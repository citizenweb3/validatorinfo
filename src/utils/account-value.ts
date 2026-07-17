import { addUnsignedDecimalStrings, formatBaseUnits, normalizeUnsignedInteger } from '@/utils/decimal-string';

export type AccountValueReady = {
  status: 'ready';
  denom: string;
  coinDecimals: number;
  liquid: string;
  staked: string;
  unbonding: string;
  rewards: string;
  totalBase: string;
  totalUsd: number | null;
  price: number | null;
  updatedAt: Date;
};

type AccountValueParts = {
  liquid: string;
  staked: string;
  unbonding: string;
  rewards: string;
};

type StoredAccountValue = AccountValueParts & {
  denom: string;
  updatedAt: Date | null;
};

type AccountValueContext = {
  denom: string;
  minimalDenom: string;
  coinDecimals: number;
};

export const composeReadyAccountValue = (
  parts: AccountValueParts,
  denom: string,
  coinDecimals: number,
  price: number | null,
  updatedAt: Date,
): AccountValueReady => {
  const normalizedParts = {
    liquid: normalizeUnsignedInteger(parts.liquid),
    staked: normalizeUnsignedInteger(parts.staked),
    unbonding: normalizeUnsignedInteger(parts.unbonding),
    rewards: normalizeUnsignedInteger(parts.rewards),
  };
  const totalBase = Object.values(normalizedParts).reduce(addUnsignedDecimalStrings, '0');
  const normalizedPrice = price !== null && Number.isFinite(price) && price > 0 ? price : null;
  const tokenAmount = Number(formatBaseUnits(totalBase, coinDecimals));
  const convertedUsd = normalizedPrice === null ? null : tokenAmount * normalizedPrice;

  return {
    status: 'ready',
    denom,
    coinDecimals,
    ...normalizedParts,
    totalBase,
    totalUsd: convertedUsd !== null && Number.isFinite(convertedUsd) ? convertedUsd : null,
    price: normalizedPrice,
    updatedAt,
  };
};

export const composeStoredAccountValue = (
  stored: StoredAccountValue | null,
  context: AccountValueContext,
  price: number | null,
): AccountValueReady | { status: 'pending' } => {
  if (!stored?.updatedAt || stored.denom !== context.minimalDenom) return { status: 'pending' };
  return composeReadyAccountValue(stored, context.denom, context.coinDecimals, price, stored.updatedAt);
};
