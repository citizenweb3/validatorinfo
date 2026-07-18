import { normalizeBech32Address } from '@/utils/bech32-address';
import { type TxByAddressChain, toTxByAddressChain } from '@/utils/tx-supported-chains';

export type TransferKind = 'wallet_to_wallet' | 'module_transfer' | 'staking_related' | 'fee_or_reward' | 'unknown';

export type TransferDirection = 'in' | 'out' | null;

export type TransferClassification = {
  kind: TransferKind;
  direction: TransferDirection;
};

type TransferParticipants = {
  fromAddr: string;
  toAddr: string;
};

const ADDRESS_PREFIX_BY_CHAIN: Record<TxByAddressChain, string> = {
  cosmoshub: 'cosmos',
  atomone: 'atone',
};

// Verified against each chain's live /cosmos/auth/v1beta1/module_accounts response on 2026-07-18.
// IBC channel escrow addresses are intentionally not static: full transaction message types identify
// IBC execution without making this list stale every time a channel is added.
const MODULE_ADDRESSES_BY_CHAIN: Record<TxByAddressChain, ReadonlySet<string>> = {
  cosmoshub: new Set([
    'cosmos1fl48vsnmsdzcv85q5d2q4z5ajdha8yu34mf0eh',
    'cosmos1ap0mh6xzfn8943urr84q6ae7zfnar48am2erhd',
    'cosmos1jv65s3grqf6v6jl3dp4t6c9t9rk99cd88lyufl',
    'cosmos17xpfvakm2amg962yls6f84z3kell8c5lserqta',
    'cosmos1el68mjnzv87uurqks8u29tec0cj32970muy2xw',
    'cosmos13pxn9n3qw79e03844rdadagmg0nshmwf7qvuye',
    'cosmos10d07y265gmmuvt4z0w9aw880jnsr700j6zn9kn',
    'cosmos1vlthgax23ca9syk7xgaz347xmf4nunef8gkhvs',
    'cosmos1m3h30wlvsf8llruxtpukdvsy0km2kum8g38c8q',
    'cosmos1tygms3xhhs3yv487phx3dw4a95jn7t7lpm470r',
    'cosmos19ejy8n9qsectrf4semdp9cpknflld0j6aqaddp',
    'cosmos1yl6hdjhmkf37639730gffanpzndzdpmhwlkfhr',
    'cosmos1xds4f0m87ajl3a6az6s2enhxrd0wta48sxu2nl',
  ]),
  atomone: new Set([
    'atone1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3mm4g00',
    'atone1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8flcml8',
    'atone1r4mgukxzu7gkh3punlrt5tmpne3s4q5j59rxdp',
    'atone17xpfvakm2amg962yls6f84z3kell8c5l7el8a9',
    'atone10d07y265gmmuvt4z0w9aw880jnsr700j5z0zqt',
    'atone1vlthgax23ca9syk7xgaz347xmf4nuneffg2s6g',
    'atone1m3h30wlvsf8llruxtpukdvsy0km2kum8x3ml3c',
    'atone1tygms3xhhs3yv487phx3dw4a95jn7t7l0mfeem',
    'atone1mdzd4uhfvherp7tf8zqwusfetd6txaseqzfssq',
    'atone1yl6hdjhmkf37639730gffanpzndzdpmhql2wpm',
  ]),
};

const DISTRIBUTION_ADDRESS_BY_CHAIN: Record<TxByAddressChain, string> = {
  cosmoshub: 'cosmos1jv65s3grqf6v6jl3dp4t6c9t9rk99cd88lyufl',
  atomone: 'atone1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8flcml8',
};

const getDirection = (fromAddr: string, toAddr: string, accountAddress: string): TransferDirection => {
  const isSender = fromAddr === accountAddress;
  const isReceiver = toAddr === accountAddress;
  if (isSender === isReceiver) return null;
  return isReceiver ? 'in' : 'out';
};

export const classifyTransfer = (
  transfer: TransferParticipants,
  msgTypes: readonly string[],
  accountAddress: string,
  chainName: string,
): TransferClassification => {
  const chain = toTxByAddressChain(chainName);
  if (!chain) return { kind: 'unknown', direction: null };

  const prefix = ADDRESS_PREFIX_BY_CHAIN[chain];
  const fromAddr = normalizeBech32Address(transfer.fromAddr, prefix);
  const toAddr = normalizeBech32Address(transfer.toAddr, prefix);
  const account = normalizeBech32Address(accountAddress, prefix);
  if (!fromAddr || !toAddr || !account) return { kind: 'unknown', direction: null };

  const direction = getDirection(fromAddr, toAddr, account);
  const distributionAddress = DISTRIBUTION_ADDRESS_BY_CHAIN[chain];
  if (fromAddr === distributionAddress || toAddr === distributionAddress) {
    return { kind: 'fee_or_reward', direction };
  }

  if (msgTypes.some((typeUrl) => typeUrl.startsWith('/cosmos.staking.'))) {
    return { kind: 'staking_related', direction };
  }

  const isIbcExecution = msgTypes.some((typeUrl) => typeUrl.startsWith('/ibc.'));
  const moduleAddresses = MODULE_ADDRESSES_BY_CHAIN[chain];
  if (isIbcExecution || moduleAddresses.has(fromAddr) || moduleAddresses.has(toAddr)) {
    return { kind: 'module_transfer', direction };
  }

  if (msgTypes.length === 0) return { kind: 'unknown', direction };
  return { kind: 'wallet_to_wallet', direction };
};
