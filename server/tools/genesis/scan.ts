import {
  extractGenesisAccountAddress,
  getGenesisAccountType,
  isSupportedGenesisAccountType,
} from '@/server/tools/genesis/accounts';
import { parseUnsignedInteger } from '@/server/tools/genesis/decimal';
import type { VerifiedGenesisSource } from '@/server/tools/genesis/fetch-verify';
import { parseAtomOneGenesis } from '@/server/tools/genesis/parse-atomone';
import { parseCosmosGenesis } from '@/server/tools/genesis/parse-cosmos';
import type { GenesisProfile } from '@/server/tools/genesis/profile';
import { consumeGenesisArray, readGenesisScalarPaths } from '@/server/tools/genesis/stream-json';
import type { GenesisValidationSection, GenesisValidationSummary } from '@/server/tools/genesis/types';

const assertAccountTypes = (profile: GenesisProfile, actualTypes: Map<string, number>): void => {
  const actual = Array.from(actualTypes.entries()).sort(([left], [right]) => left.localeCompare(right));
  const expected = Object.entries(profile.expectedAccountTypes).sort(([left], [right]) => left.localeCompare(right));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${profile.chainId} auth account type counts mismatch: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
    );
  }
};

export const validateGenesisSource = async (
  file: VerifiedGenesisSource,
  profile: GenesisProfile,
  onSection?: (section: GenesisValidationSection, count: number) => void,
): Promise<GenesisValidationSummary> => {
  const metadata = await readGenesisScalarPaths(file, {
    chainId: ['chain_id'],
    initialHeight: ['initial_height'],
    genesisTime: ['genesis_time'],
    denom: ['app_state', 'staking', 'params', 'bond_denom'],
  });
  if (metadata.chainId !== profile.chainId) {
    throw new Error(`genesis chain_id mismatch: expected ${profile.chainId}, received ${String(metadata.chainId)}`);
  }
  if (
    typeof metadata.initialHeight !== 'string' ||
    parseUnsignedInteger(metadata.initialHeight, 'initial_height') !== profile.initialHeight
  ) {
    throw new Error(
      `genesis initial_height mismatch: expected ${profile.initialHeight}, received ${String(metadata.initialHeight)}`,
    );
  }
  if (metadata.denom !== profile.denom) {
    throw new Error(`genesis staking denom mismatch: expected ${profile.denom}, received ${String(metadata.denom)}`);
  }
  if (typeof metadata.genesisTime !== 'string' || Number.isNaN(Date.parse(metadata.genesisTime))) {
    throw new Error(`genesis_time must be a valid timestamp: ${String(metadata.genesisTime)}`);
  }
  const genesisTime = new Date(metadata.genesisTime);
  onSection?.('metadata', 1);

  const accountTypes = new Map<string, number>();
  const unsupportedTypes = new Map<string, number>();
  const accounts = await consumeGenesisArray(file, 'app_state.auth.accounts', (account) => {
    const accountType = getGenesisAccountType(account);
    accountTypes.set(accountType, (accountTypes.get(accountType) ?? 0) + 1);
    if (!isSupportedGenesisAccountType(accountType)) {
      unsupportedTypes.set(accountType, (unsupportedTypes.get(accountType) ?? 0) + 1);
      return;
    }
    extractGenesisAccountAddress(account);
  });
  onSection?.('accounts', accounts);
  if (unsupportedTypes.size > 0) {
    throw new Error(`unsupported auth account wrappers: ${JSON.stringify(Object.fromEntries(unsupportedTypes))}`);
  }
  if (accounts !== profile.expectedCounts.accounts) {
    throw new Error(
      `${profile.chainId} account count mismatch: expected ${profile.expectedCounts.accounts}, received ${accounts}`,
    );
  }
  assertAccountTypes(profile, accountTypes);

  const parsed =
    profile.baselineSource === 'staking-state'
      ? await parseCosmosGenesis(file, profile, onSection)
      : await parseAtomOneGenesis(file, profile, onSection);

  return {
    chainId: profile.chainId,
    initialHeight: profile.initialHeight,
    genesisTime,
    denom: profile.denom,
    counts: {
      accounts,
      validators: parsed.validators,
      delegations: parsed.delegations,
      gentxs: parsed.gentxs,
    },
    accountTypes: Object.fromEntries(
      Array.from(accountTypes.entries()).sort(([left], [right]) => left.localeCompare(right)),
    ),
    delegationRows: parsed.rows,
  };
};

export const streamValidatedGenesisAccounts = async (
  file: VerifiedGenesisSource,
  profile: GenesisProfile,
  consume: (address: string) => void | Promise<void>,
): Promise<number> => {
  const count = await consumeGenesisArray(file, 'app_state.auth.accounts', async (account) => {
    await consume(extractGenesisAccountAddress(account));
  });
  if (count !== profile.expectedCounts.accounts) {
    throw new Error(
      `${profile.chainId} account count changed before persistence: expected ${profile.expectedCounts.accounts}, received ${count}`,
    );
  }
  return count;
};
