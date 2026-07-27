import { asRecord, readString } from '@/server/tools/genesis/validation';

const BASE_ACCOUNT_TYPE = '/cosmos.auth.v1beta1.BaseAccount';
const MODULE_ACCOUNT_TYPE = '/cosmos.auth.v1beta1.ModuleAccount';
const BASE_VESTING_ACCOUNT_TYPE = '/cosmos.vesting.v1beta1.BaseVestingAccount';
const MAX_ADDRESS_LENGTH = 128;

const WRAPPED_VESTING_ACCOUNT_TYPES = new Set([
  '/cosmos.vesting.v1beta1.ContinuousVestingAccount',
  '/cosmos.vesting.v1beta1.DelayedVestingAccount',
  '/cosmos.vesting.v1beta1.PeriodicVestingAccount',
  '/cosmos.vesting.v1beta1.PermanentLockedAccount',
  '/cosmos.vesting.v1beta1.ClawbackVestingAccount',
]);

export const getGenesisAccountType = (value: unknown): string => {
  const account = asRecord(value, 'auth account');
  return readString(account, '@type', 'auth account');
};

export const isSupportedGenesisAccountType = (accountType: string): boolean =>
  accountType === BASE_ACCOUNT_TYPE ||
  accountType === MODULE_ACCOUNT_TYPE ||
  accountType === BASE_VESTING_ACCOUNT_TYPE ||
  WRAPPED_VESTING_ACCOUNT_TYPES.has(accountType);

const validateAddress = (address: string, label: string): string => {
  if (address.length > MAX_ADDRESS_LENGTH) {
    throw new Error(`${label}.address exceeds ${MAX_ADDRESS_LENGTH} characters`);
  }
  return address;
};

export const extractGenesisAccountAddress = (value: unknown): string => {
  const account = asRecord(value, 'auth account');
  const accountType = getGenesisAccountType(account);

  if (accountType === BASE_ACCOUNT_TYPE) {
    return validateAddress(readString(account, 'address', accountType), accountType);
  }

  if (accountType === MODULE_ACCOUNT_TYPE || accountType === BASE_VESTING_ACCOUNT_TYPE) {
    const baseAccount = asRecord(account.base_account, `${accountType}.base_account`);
    return validateAddress(readString(baseAccount, 'address', `${accountType}.base_account`), accountType);
  }

  if (WRAPPED_VESTING_ACCOUNT_TYPES.has(accountType)) {
    const baseVestingAccount = asRecord(account.base_vesting_account, `${accountType}.base_vesting_account`);
    const baseAccount = asRecord(baseVestingAccount.base_account, `${accountType}.base_vesting_account.base_account`);
    return validateAddress(
      readString(baseAccount, 'address', `${accountType}.base_vesting_account.base_account`),
      accountType,
    );
  }

  throw new Error(`unsupported auth account wrapper: ${accountType}`);
};
