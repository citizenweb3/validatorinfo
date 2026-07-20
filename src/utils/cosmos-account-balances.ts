import { fetchAllLcdDelegations, fetchLcdRewardsByValidator } from '@/utils/cosmos-account-delegations';
import { addUnsignedDecimalStrings, floorUnsignedDecimal, normalizeUnsignedInteger } from '@/utils/decimal-string';

const PAGE_SIZE = 200;
const MAX_PAGES = 50;
const MAX_ENTRIES = PAGE_SIZE * MAX_PAGES;
const MAX_STORED_DIGITS = 80;

export const ACCOUNT_BALANCE_CHAIN_NAMES = ['cosmoshub', 'atomone'] as const;

export type AccountBalanceChainName = (typeof ACCOUNT_BALANCE_CHAIN_NAMES)[number];

type JsonRecord = Record<string, unknown>;
type JsonLoader = (path: string) => Promise<unknown>;

export type CosmosAccountBalanceParts = {
  liquid: string;
  staked: string;
  unbonding: string;
  rewards: string;
};

type ParsedUnbondingPage = {
  amount: string;
  entryCount: number;
  nextKey: string | null;
};

export const isAccountBalanceChainSupported = (chainName: string): chainName is AccountBalanceChainName =>
  ACCOUNT_BALANCE_CHAIN_NAMES.includes(chainName.toLowerCase() as AccountBalanceChainName);

const asRecord = (value: unknown, label: string): JsonRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as JsonRecord;
};

const readString = (record: JsonRecord, field: string, label: string): string => {
  const value = record[field];
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label}.${field} must be a string`);
  return value;
};

const readArray = (record: JsonRecord, field: string, label: string): unknown[] => {
  const value = record[field];
  if (!Array.isArray(value)) throw new Error(`${label}.${field} must be an array`);
  return value;
};

const readNextKey = (payload: JsonRecord): string | null => {
  if (payload.pagination === null || payload.pagination === undefined) return null;
  const pagination = asRecord(payload.pagination, 'unbonding pagination');
  const nextKey = pagination.next_key;
  if (nextKey === null || nextKey === undefined || nextKey === '') return null;
  if (typeof nextKey !== 'string') throw new Error('unbonding pagination.next_key must be a string or null');
  return nextKey;
};

const normalizeStoredAmount = (value: string, label: string): string => {
  const amount = normalizeUnsignedInteger(value);
  if (amount.length > MAX_STORED_DIGITS) {
    throw new Error(`${label} exceeds ${MAX_STORED_DIGITS} digits`);
  }
  return amount;
};

const addStoredAmounts = (left: string, right: string, label: string): string =>
  normalizeStoredAmount(addUnsignedDecimalStrings(left, right), label);

export const parseLcdSpendableBalance = (value: unknown, expectedDenom: string): string => {
  const payload = asRecord(value, 'spendable balance response');
  if (payload.balance === null || payload.balance === undefined) return '0';

  const balance = asRecord(payload.balance, 'spendable balance response.balance');
  const denom = readString(balance, 'denom', 'spendable balance response.balance');
  if (denom !== expectedDenom) {
    throw new Error(`spendable balance denom mismatch: expected ${expectedDenom}, received ${denom}`);
  }
  return normalizeStoredAmount(readString(balance, 'amount', 'spendable balance response.balance'), 'liquid');
};

export const fetchLcdSpendableBalance = async (
  delegatorAddress: string,
  expectedDenom: string,
  loadJson: JsonLoader,
): Promise<string> => {
  const path = `/cosmos/bank/v1beta1/spendable_balances/${encodeURIComponent(delegatorAddress)}/by_denom?denom=${encodeURIComponent(expectedDenom)}`;
  return parseLcdSpendableBalance(await loadJson(path), expectedDenom);
};

export const parseLcdUnbondingPage = (value: unknown): ParsedUnbondingPage => {
  const payload = asRecord(value, 'unbonding response');
  const responses = readArray(payload, 'unbonding_responses', 'unbonding response');
  let amount = '0';
  let entryCount = 0;

  responses.forEach((responseValue, responseIndex) => {
    const response = asRecord(responseValue, `unbonding response ${responseIndex}`);
    const entries = readArray(response, 'entries', `unbonding response ${responseIndex}`);
    entries.forEach((entryValue, entryIndex) => {
      const entry = asRecord(entryValue, `unbonding response ${responseIndex}.entry ${entryIndex}`);
      const balance = normalizeStoredAmount(
        readString(entry, 'balance', `unbonding response ${responseIndex}.entry ${entryIndex}`),
        'unbonding',
      );
      amount = addStoredAmounts(amount, balance, 'unbonding');
      entryCount += 1;
    });
  });

  return { amount, entryCount, nextKey: readNextKey(payload) };
};

const buildUnbondingPath = (delegatorAddress: string, nextKey: string | null): string => {
  const searchParams = new URLSearchParams({
    'pagination.limit': String(PAGE_SIZE),
    'pagination.count_total': 'false',
  });
  if (nextKey) searchParams.set('pagination.key', nextKey);
  return `/cosmos/staking/v1beta1/delegators/${encodeURIComponent(delegatorAddress)}/unbonding_delegations?${searchParams}`;
};

export const fetchAllLcdUnbonding = async (delegatorAddress: string, loadJson: JsonLoader): Promise<string> => {
  const seenKeys = new Set<string>();
  let amount = '0';
  let entryCount = 0;
  let nextKey: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    if (nextKey) seenKeys.add(nextKey);
    const parsed = parseLcdUnbondingPage(await loadJson(buildUnbondingPath(delegatorAddress, nextKey)));
    amount = addStoredAmounts(amount, parsed.amount, 'unbonding');
    entryCount += parsed.entryCount;
    if (entryCount > MAX_ENTRIES) throw new Error(`unbonding response exceeds ${MAX_ENTRIES} entries`);
    if (!parsed.nextKey) return amount;
    if (seenKeys.has(parsed.nextKey)) throw new Error('unbonding pagination repeated next_key');
    nextKey = parsed.nextKey;
  }

  throw new Error(`unbonding pagination exceeds ${MAX_PAGES} pages`);
};

export const fetchCosmosAccountBalanceParts = async (
  delegatorAddress: string,
  expectedDenom: string,
  loadJson: JsonLoader,
): Promise<CosmosAccountBalanceParts> => {
  const [liquid, positions, rewardsByValidator, unbonding] = await Promise.all([
    fetchLcdSpendableBalance(delegatorAddress, expectedDenom, loadJson),
    fetchAllLcdDelegations(delegatorAddress, expectedDenom, loadJson),
    fetchLcdRewardsByValidator(delegatorAddress, expectedDenom, loadJson),
    fetchAllLcdUnbonding(delegatorAddress, loadJson),
  ]);

  const staked = positions.reduce(
    (total, position) => addStoredAmounts(total, normalizeStoredAmount(position.amount, 'staked'), 'staked'),
    '0',
  );
  const rewardDecimal = Array.from(rewardsByValidator.values()).reduce(
    (total, reward) => addUnsignedDecimalStrings(total, reward),
    '0',
  );
  const rewards = normalizeStoredAmount(floorUnsignedDecimal(rewardDecimal), 'rewards');

  return { liquid, staked, unbonding, rewards };
};
