import { bech32 } from 'bech32';
import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyTransfer } from '@/utils/classify-transfer';

const wallet = (prefix: string, byte: number): string =>
  bech32.encode(prefix, bech32.toWords(Uint8Array.from({ length: 20 }, () => byte)));

const cosmosAccount = wallet('cosmos', 1);
const cosmosPeer = wallet('cosmos', 2);
const cosmosEscrowLikeAddress = wallet('cosmos', 3);
const cosmosDistribution = 'cosmos1jv65s3grqf6v6jl3dp4t6c9t9rk99cd88lyufl';
const cosmosBondedPool = 'cosmos1fl48vsnmsdzcv85q5d2q4z5ajdha8yu34mf0eh';

test('transfer classification covers all five Stage 1 kinds and precedence', () => {
  assert.deepEqual(
    classifyTransfer(
      { fromAddr: cosmosDistribution, toAddr: cosmosAccount },
      ['/cosmos.staking.v1beta1.MsgDelegate'],
      cosmosAccount,
      'cosmoshub',
    ),
    { kind: 'fee_or_reward', direction: 'in' },
  );
  assert.deepEqual(
    classifyTransfer(
      { fromAddr: cosmosAccount, toAddr: cosmosBondedPool },
      ['/cosmos.staking.v1beta1.MsgDelegate'],
      cosmosAccount,
      'cosmoshub',
    ),
    { kind: 'staking_related', direction: 'out' },
  );
  assert.deepEqual(
    classifyTransfer(
      { fromAddr: cosmosAccount, toAddr: cosmosBondedPool },
      ['/cosmos.bank.v1beta1.MsgSend'],
      cosmosAccount,
      'cosmoshub',
    ),
    { kind: 'module_transfer', direction: 'out' },
  );
  assert.deepEqual(
    classifyTransfer(
      { fromAddr: cosmosAccount, toAddr: cosmosPeer },
      ['/cosmos.bank.v1beta1.MsgSend'],
      cosmosAccount,
      'cosmoshub',
    ),
    { kind: 'wallet_to_wallet', direction: 'out' },
  );
  assert.deepEqual(classifyTransfer({ fromAddr: cosmosAccount, toAddr: cosmosPeer }, [], cosmosAccount, 'cosmoshub'), {
    kind: 'unknown',
    direction: 'out',
  });
});

test('IBC message facts classify dynamic escrow transfers without a channel address list', () => {
  assert.deepEqual(
    classifyTransfer(
      { fromAddr: cosmosAccount, toAddr: cosmosEscrowLikeAddress },
      ['/ibc.applications.transfer.v1.MsgTransfer'],
      cosmosAccount,
      'cosmoshub',
    ),
    { kind: 'module_transfer', direction: 'out' },
  );
});

test('distribution reward messages stay staking-related without a distribution-module counterparty', () => {
  for (const typeUrl of [
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  ]) {
    assert.deepEqual(
      classifyTransfer({ fromAddr: cosmosAccount, toAddr: cosmosPeer }, [typeUrl], cosmosAccount, 'cosmoshub'),
      { kind: 'staking_related', direction: 'out' },
    );
  }
});

test('classification fails honestly on invalid participants and handles self direction', () => {
  assert.deepEqual(
    classifyTransfer(
      { fromAddr: 'not-an-address', toAddr: cosmosAccount },
      ['/cosmos.bank.v1beta1.MsgSend'],
      cosmosAccount,
      'cosmoshub',
    ),
    { kind: 'unknown', direction: null },
  );
  assert.deepEqual(
    classifyTransfer(
      { fromAddr: cosmosAccount, toAddr: cosmosAccount },
      ['/cosmos.bank.v1beta1.MsgSend'],
      cosmosAccount,
      'cosmoshub',
    ),
    { kind: 'wallet_to_wallet', direction: null },
  );
});
