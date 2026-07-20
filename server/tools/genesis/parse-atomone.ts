import { parseUnsignedInteger } from '@/server/tools/genesis/decimal';
import type { VerifiedGenesisSource } from '@/server/tools/genesis/fetch-verify';
import type { GenesisProfile } from '@/server/tools/genesis/profile';
import { consumeGenesisArray } from '@/server/tools/genesis/stream-json';
import type { GenesisDelegationRow, GenesisValidationSection } from '@/server/tools/genesis/types';
import { asRecord, readArray, readString } from '@/server/tools/genesis/validation';

type AtomOneParseResult = {
  validators: number;
  delegations: number;
  gentxs: number;
  rows: GenesisDelegationRow[];
};

const CREATE_VALIDATOR_TYPE = '/cosmos.staking.v1beta1.MsgCreateValidator';

export const parseAtomOneGenesis = async (
  file: VerifiedGenesisSource,
  profile: GenesisProfile,
  onSection?: (section: GenesisValidationSection, count: number) => void,
): Promise<AtomOneParseResult> => {
  const validatorCount = await consumeGenesisArray(file, 'app_state.staking.validators', () => undefined);
  onSection?.('validators', validatorCount);
  const delegationCount = await consumeGenesisArray(file, 'app_state.staking.delegations', () => undefined);
  onSection?.('delegations', delegationCount);

  const totals = new Map<string, { row: Omit<GenesisDelegationRow, 'amount'>; amount: bigint }>();
  const gentxCount = await consumeGenesisArray(file, 'app_state.genutil.gen_txs', (value) => {
    const gentx = asRecord(value, 'genutil gentx');
    const body = asRecord(gentx.body, 'genutil gentx body');
    const messages = readArray(body, 'messages', 'genutil gentx body');
    if (messages.length !== 1) throw new Error('genutil gentx must contain exactly one create-validator message');

    const message = asRecord(messages[0], 'genutil create-validator message');
    if (message['@type'] !== CREATE_VALIDATOR_TYPE) {
      throw new Error(`unsupported gentx message type: ${String(message['@type'])}`);
    }
    const delegatorAddress = readString(message, 'delegator_address', 'genutil create-validator message');
    const validatorAddress = readString(message, 'validator_address', 'genutil create-validator message');
    if (delegatorAddress.length > 128 || validatorAddress.length > 128) {
      throw new Error('gentx address exceeds 128 characters');
    }

    const valueCoin = asRecord(message.value, 'genutil create-validator value');
    const denom = readString(valueCoin, 'denom', 'genutil create-validator value');
    if (denom !== profile.denom) {
      throw new Error(`gentx denom mismatch: expected ${profile.denom}, received ${denom}`);
    }
    const amount = parseUnsignedInteger(
      readString(valueCoin, 'amount', 'genutil create-validator value'),
      'gentx amount',
    );
    if (amount <= BigInt(0)) throw new Error('gentx amount must be greater than zero');

    const key = `${delegatorAddress}\u0000${validatorAddress}\u0000${denom}`;
    const existing = totals.get(key);
    if (existing) {
      existing.amount += amount;
      return;
    }
    totals.set(key, { row: { delegatorAddress, validatorAddress, denom }, amount });
  });
  onSection?.('gentxs', gentxCount);

  for (const [label, actual, expected] of [
    ['validator', validatorCount, profile.expectedCounts.validators],
    ['delegation', delegationCount, profile.expectedCounts.delegations],
    ['gentx', gentxCount, profile.expectedCounts.gentxs],
  ] as const) {
    if (actual !== expected) {
      throw new Error(`${profile.chainId} ${label} count mismatch: expected ${expected}, received ${actual}`);
    }
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
