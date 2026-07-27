import {
  addUnsignedDecimalStrings,
  compareUnsignedDecimalStrings,
  formatBaseUnits,
  normalizeUnsignedDecimal,
} from '@/utils/decimal-string';

const DELEGATIONS_PAGE_SIZE = 200;
const MAX_DELEGATIONS_PAGES = 50;
const MAX_DELEGATION_ROWS = DELEGATIONS_PAGE_SIZE * MAX_DELEGATIONS_PAGES;
const SUPPORTED_ACCOUNT_DELEGATION_CHAINS = new Set(['cosmoshub', 'atomone']);

type JsonRecord = Record<string, unknown>;
type JsonLoader = (path: string) => Promise<unknown>;

export type LcdDelegationPosition = {
  validatorAddress: string;
  amount: string;
};

export type AccountDelegationNodeIdentity = {
  operatorAddress: string;
  validatorId: number | null;
  moniker: string;
  icon: string | null;
};

export type AccountDelegationRow = {
  operatorAddress: string;
  validatorId: number | null;
  validatorName: string;
  validatorIcon: string | null;
  stakedAmount: string;
  rewardAmount: string;
};

export const isAccountDelegationsChainSupported = (chainName: string): boolean =>
  SUPPORTED_ACCOUNT_DELEGATION_CHAINS.has(chainName.toLowerCase());

type ParsedDelegationPage = {
  rows: LcdDelegationPosition[];
  nextKey: string | null;
};

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
  const pagination = asRecord(payload.pagination, 'delegations pagination');
  const nextKey = pagination.next_key;
  if (nextKey === null || nextKey === undefined || nextKey === '') return null;
  if (typeof nextKey !== 'string') throw new Error('delegations pagination.next_key must be a string or null');
  return nextKey;
};

export const parseLcdDelegationPage = (value: unknown, expectedDenom: string): ParsedDelegationPage => {
  const payload = asRecord(value, 'delegations response');
  const rows = readArray(payload, 'delegation_responses', 'delegations response').map((entry, index) => {
    const response = asRecord(entry, `delegation response ${index}`);
    const delegation = asRecord(response.delegation, `delegation response ${index}.delegation`);
    const balance = asRecord(response.balance, `delegation response ${index}.balance`);
    const validatorAddress = readString(delegation, 'validator_address', `delegation response ${index}.delegation`);
    const denom = readString(balance, 'denom', `delegation response ${index}.balance`);
    if (denom !== expectedDenom) {
      throw new Error(`delegation denom mismatch: expected ${expectedDenom}, received ${denom}`);
    }
    const amount = normalizeUnsignedDecimal(readString(balance, 'amount', `delegation response ${index}.balance`));
    return { validatorAddress, amount };
  });

  return { rows, nextKey: readNextKey(payload) };
};

const buildDelegationsPath = (delegatorAddress: string, nextKey: string | null): string => {
  const searchParams = new URLSearchParams({
    'pagination.limit': String(DELEGATIONS_PAGE_SIZE),
    'pagination.count_total': 'false',
  });
  if (nextKey) searchParams.set('pagination.key', nextKey);
  return `/cosmos/staking/v1beta1/delegations/${encodeURIComponent(delegatorAddress)}?${searchParams}`;
};

export const fetchAllLcdDelegations = async (
  delegatorAddress: string,
  expectedDenom: string,
  loadJson: JsonLoader,
): Promise<LcdDelegationPosition[]> => {
  const rows: LcdDelegationPosition[] = [];
  const seenKeys = new Set<string>();
  let nextKey: string | null = null;

  for (let page = 0; page < MAX_DELEGATIONS_PAGES; page++) {
    if (nextKey) seenKeys.add(nextKey);
    const payload = await loadJson(buildDelegationsPath(delegatorAddress, nextKey));
    const parsed = parseLcdDelegationPage(payload, expectedDenom);
    rows.push(...parsed.rows);
    if (rows.length > MAX_DELEGATION_ROWS) {
      throw new Error(`delegations response exceeds ${MAX_DELEGATION_ROWS} rows`);
    }
    if (!parsed.nextKey) return rows;
    if (seenKeys.has(parsed.nextKey)) throw new Error('delegations pagination repeated next_key');
    nextKey = parsed.nextKey;
  }

  throw new Error(`delegations pagination exceeds ${MAX_DELEGATIONS_PAGES} pages`);
};

export const parseLcdRewardsByValidator = (value: unknown, expectedDenom: string): Map<string, string> => {
  const payload = asRecord(value, 'delegator rewards response');
  const entries = readArray(payload, 'rewards', 'delegator rewards response');
  if (entries.length > MAX_DELEGATION_ROWS) {
    throw new Error(`delegator rewards response exceeds ${MAX_DELEGATION_ROWS} validators`);
  }

  const totals = new Map<string, string>();
  entries.forEach((entry, entryIndex) => {
    const rewardEntry = asRecord(entry, `delegator reward ${entryIndex}`);
    const validatorAddress = readString(rewardEntry, 'validator_address', `delegator reward ${entryIndex}`);
    const coins = readArray(rewardEntry, 'reward', `delegator reward ${entryIndex}`);
    coins.forEach((coinValue, coinIndex) => {
      const coin = asRecord(coinValue, `delegator reward ${entryIndex}.reward ${coinIndex}`);
      const denom = readString(coin, 'denom', `delegator reward ${entryIndex}.reward ${coinIndex}`);
      const amount = normalizeUnsignedDecimal(
        readString(coin, 'amount', `delegator reward ${entryIndex}.reward ${coinIndex}`),
      );
      if (denom !== expectedDenom) return;
      totals.set(validatorAddress, addUnsignedDecimalStrings(totals.get(validatorAddress) ?? '0', amount));
    });
  });

  return totals;
};

export const fetchLcdRewardsByValidator = async (
  delegatorAddress: string,
  expectedDenom: string,
  loadJson: JsonLoader,
): Promise<Map<string, string>> => {
  const path = `/cosmos/distribution/v1beta1/delegators/${encodeURIComponent(delegatorAddress)}/rewards`;
  return parseLcdRewardsByValidator(await loadJson(path), expectedDenom);
};

export const composeAccountDelegationRows = (
  positions: readonly LcdDelegationPosition[],
  rewardsByValidator: ReadonlyMap<string, string>,
  identities: readonly AccountDelegationNodeIdentity[],
  coinDecimals: number,
): AccountDelegationRow[] => {
  const positionTotals = new Map<string, string>();
  positions.forEach((position) => {
    positionTotals.set(
      position.validatorAddress,
      addUnsignedDecimalStrings(positionTotals.get(position.validatorAddress) ?? '0', position.amount),
    );
  });
  const identityByOperator = new Map(identities.map((identity) => [identity.operatorAddress, identity]));

  return Array.from(positionTotals.entries())
    .sort(([leftAddress, leftAmount], [rightAddress, rightAmount]) => {
      const amountOrder = compareUnsignedDecimalStrings(rightAmount, leftAmount);
      return amountOrder || leftAddress.localeCompare(rightAddress);
    })
    .map(([operatorAddress, stakedBaseAmount]) => {
      const identity = identityByOperator.get(operatorAddress);
      return {
        operatorAddress,
        validatorId: identity?.validatorId ?? null,
        validatorName: identity?.moniker ?? operatorAddress,
        validatorIcon: identity?.icon ?? null,
        stakedAmount: formatBaseUnits(stakedBaseAmount, coinDecimals),
        rewardAmount: formatBaseUnits(rewardsByValidator.get(operatorAddress) ?? '0', coinDecimals),
      };
    });
};
