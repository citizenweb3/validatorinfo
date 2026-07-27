import { floorDelegationTokens, parseUnsignedDecimal, parseUnsignedInteger } from '@/server/tools/genesis/decimal';
import type { VerifiedGenesisSource } from '@/server/tools/genesis/fetch-verify';
import type { GenesisProfile } from '@/server/tools/genesis/profile';
import { consumeGenesisArray } from '@/server/tools/genesis/stream-json';
import type { GenesisDelegationRow, GenesisValidationSection } from '@/server/tools/genesis/types';
import { asRecord, readString } from '@/server/tools/genesis/validation';

type ValidatorState = {
  tokens: string;
  delegatorShares: string;
};

type CosmosParseResult = {
  validators: number;
  delegations: number;
  gentxs: number;
  rows: GenesisDelegationRow[];
};

const compositeKey = (delegator: string, validator: string, denom: string): string =>
  `${delegator}\u0000${validator}\u0000${denom}`;

export const parseCosmosGenesis = async (
  file: VerifiedGenesisSource,
  profile: GenesisProfile,
  onSection?: (section: GenesisValidationSection, count: number) => void,
): Promise<CosmosParseResult> => {
  const validators = new Map<string, ValidatorState>();
  const validatorCount = await consumeGenesisArray(file, 'app_state.staking.validators', (value) => {
    const validator = asRecord(value, 'staking validator');
    const operatorAddress = readString(validator, 'operator_address', 'staking validator');
    if (operatorAddress.length > 128) throw new Error(`validator address exceeds 128 characters: ${operatorAddress}`);
    if (validators.has(operatorAddress)) throw new Error(`duplicate staking validator: ${operatorAddress}`);

    const tokens = readString(validator, 'tokens', `staking validator ${operatorAddress}`);
    const delegatorShares = readString(validator, 'delegator_shares', `staking validator ${operatorAddress}`);
    parseUnsignedInteger(tokens, `staking validator ${operatorAddress} tokens`);
    const parsedShares = parseUnsignedDecimal(delegatorShares, `staking validator ${operatorAddress} delegator_shares`);
    if (parsedShares.numerator === BigInt(0)) {
      throw new Error(`staking validator ${operatorAddress} delegator_shares must be greater than zero`);
    }

    validators.set(operatorAddress, { tokens, delegatorShares });
  });
  onSection?.('validators', validatorCount);

  const totals = new Map<string, { row: Omit<GenesisDelegationRow, 'amount'>; amount: bigint }>();
  const delegationCount = await consumeGenesisArray(file, 'app_state.staking.delegations', (value) => {
    const delegation = asRecord(value, 'staking delegation');
    const delegatorAddress = readString(delegation, 'delegator_address', 'staking delegation');
    const validatorAddress = readString(delegation, 'validator_address', 'staking delegation');
    const shares = readString(delegation, 'shares', 'staking delegation');
    if (delegatorAddress.length > 128 || validatorAddress.length > 128) {
      throw new Error('staking delegation address exceeds 128 characters');
    }

    const validator = validators.get(validatorAddress);
    if (!validator) throw new Error(`delegation references unknown validator: ${validatorAddress}`);
    const amount = floorDelegationTokens(shares, validator.tokens, validator.delegatorShares);
    if (amount <= BigInt(0)) {
      throw new Error(`delegation resolves to a non-positive token amount: ${delegatorAddress}/${validatorAddress}`);
    }

    const key = compositeKey(delegatorAddress, validatorAddress, profile.denom);
    const existing = totals.get(key);
    if (existing) {
      existing.amount += amount;
      return;
    }
    totals.set(key, {
      row: { delegatorAddress, validatorAddress, denom: profile.denom },
      amount,
    });
  });
  onSection?.('delegations', delegationCount);

  const gentxCount = await consumeGenesisArray(file, 'app_state.genutil.gen_txs', () => undefined);
  onSection?.('gentxs', gentxCount);

  if (validatorCount !== profile.expectedCounts.validators) {
    throw new Error(
      `${profile.chainId} validator count mismatch: expected ${profile.expectedCounts.validators}, received ${validatorCount}`,
    );
  }
  if (delegationCount !== profile.expectedCounts.delegations) {
    throw new Error(
      `${profile.chainId} delegation count mismatch: expected ${profile.expectedCounts.delegations}, received ${delegationCount}`,
    );
  }
  if (gentxCount !== profile.expectedCounts.gentxs) {
    throw new Error(
      `${profile.chainId} gentx count mismatch: expected ${profile.expectedCounts.gentxs}, received ${gentxCount}`,
    );
  }

  const rows = Array.from(totals.values())
    .map(({ row, amount }) => ({ ...row, amount: amount.toString() }))
    .sort((left, right) =>
      `${left.delegatorAddress}\u0000${left.validatorAddress}\u0000${left.denom}`.localeCompare(
        `${right.delegatorAddress}\u0000${right.validatorAddress}\u0000${right.denom}`,
      ),
    );
  if (rows.length !== profile.expectedCounts.storedDelegations) {
    throw new Error(
      `${profile.chainId} stored delegation count mismatch: expected ${profile.expectedCounts.storedDelegations}, received ${rows.length}`,
    );
  }

  return { validators: validatorCount, delegations: delegationCount, gentxs: gentxCount, rows };
};
