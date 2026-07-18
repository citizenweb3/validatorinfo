import { toTxByAddressChain, type TxByAddressChain } from '@/utils/tx-supported-chains';

export const TX_MESSAGE_FILTER_IDS = [
  'send',
  'delegate',
  'undelegate',
  'redelegate',
  'withdrawRewards',
  'vote',
  'ibcTransfer',
] as const;

export type TxMessageFilterId = (typeof TX_MESSAGE_FILTER_IDS)[number];

export type TxMessageFilterOption = {
  id: TxMessageFilterId;
  typeUrls: readonly string[];
};

const SHARED_MESSAGE_TYPES = {
  send: ['/cosmos.bank.v1beta1.MsgSend'],
  delegate: ['/cosmos.staking.v1beta1.MsgDelegate'],
  undelegate: ['/cosmos.staking.v1beta1.MsgUndelegate'],
  redelegate: ['/cosmos.staking.v1beta1.MsgBeginRedelegate'],
  withdrawRewards: ['/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'],
  ibcTransfer: ['/ibc.applications.transfer.v1.MsgTransfer'],
} as const;

const MESSAGE_TYPES_BY_CHAIN: Record<
  TxByAddressChain,
  Record<TxMessageFilterId, readonly string[]>
> = {
  cosmoshub: {
    ...SHARED_MESSAGE_TYPES,
    vote: ['/cosmos.gov.v1.MsgVote'],
  },
  atomone: {
    ...SHARED_MESSAGE_TYPES,
    // AtomOne v4 uses the Cosmos namespace; historical transactions retain the AtomOne namespace.
    vote: ['/atomone.gov.v1.MsgVote', '/cosmos.gov.v1.MsgVote'],
  },
};

export const getTxMessageFilterOptions = (chainName: string): TxMessageFilterOption[] => {
  const chain = toTxByAddressChain(chainName);
  if (!chain) return [];

  return TX_MESSAGE_FILTER_IDS.map((id) => ({ id, typeUrls: MESSAGE_TYPES_BY_CHAIN[chain][id] }));
};

export const getAllowedTxMessageTypes = (chainName: string): ReadonlySet<string> =>
  new Set(getTxMessageFilterOptions(chainName).flatMap((option) => option.typeUrls));

export const resolveTxMessageTypes = (chainName: string, selectedIds: readonly TxMessageFilterId[]): string[] => {
  const chain = toTxByAddressChain(chainName);
  if (!chain) return [];

  return Array.from(new Set(selectedIds.flatMap((id) => MESSAGE_TYPES_BY_CHAIN[chain][id]))).sort();
};

export const resolveTxMessageFilterIds = (
  chainName: string,
  committedTypeUrls: readonly string[],
): TxMessageFilterId[] => {
  const selected = new Set(committedTypeUrls);
  return getTxMessageFilterOptions(chainName)
    .filter((option) => option.typeUrls.some((typeUrl) => selected.has(typeUrl)))
    .map((option) => option.id);
};
