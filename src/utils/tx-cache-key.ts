type TxByAddressCacheKeyInput = {
  chainName: string;
  addresses: string;
  filterKey: string;
  cursorKey: string;
};

export const buildTxByAddressCacheKey = ({
  chainName,
  addresses,
  filterKey,
  cursorKey,
}: TxByAddressCacheKeyInput): string =>
  `txs:byaddr:${chainName}:${addresses.split(',').sort().join(',')}:${filterKey ? `${filterKey}:` : ''}${cursorKey}`;
