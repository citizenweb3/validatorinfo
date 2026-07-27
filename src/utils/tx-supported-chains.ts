// Single source of truth for chains that expose a working transactions page
// (/networks/[name]/tx). Used to gate the tx icon on /networks and the tx links
// on /ecosystems.
//
// Two rendering paths sit behind these chains, both reached from
// `src/app/[locale]/networks/[name]/tx/page.tsx`:
//   - monero (consensusType 'pow') renders the dedicated <MoneroTxs> list;
//   - the rest render <NetworkTxs>, whose data comes from the getTxsByChainName
//     dispatcher in `src/app/services/tx-service.ts`.
// Keep this list in sync with those two paths.
export const TX_SUPPORTED_CHAINS = [
  'aztec',
  'logos-testnet',
  'miden-testnet',
  'cosmoshub',
  'atomone',
  'monero',
] as const;

export type TxSupportedChain = (typeof TX_SUPPORTED_CHAINS)[number];

export const hasTxPage = (chainName: string): boolean =>
  (TX_SUPPORTED_CHAINS as readonly string[]).includes(chainName.toLowerCase());

export const TX_BY_ADDRESS_CHAINS = ['cosmoshub', 'atomone'] as const;

export type TxByAddressChain = (typeof TX_BY_ADDRESS_CHAINS)[number];

export const toTxByAddressChain = (chainName: string): TxByAddressChain | null => {
  const normalizedChainName = chainName.toLowerCase();
  if (normalizedChainName === 'cosmoshub' || normalizedChainName === 'atomone') {
    return normalizedChainName;
  }
  return null;
};

export const isTxByAddressChainSupported = (chainName: string): boolean => toTxByAddressChain(chainName) !== null;
