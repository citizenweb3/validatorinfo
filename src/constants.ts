import { cosmostationWalletProvider } from '@/providers/cosmostation';
import { keplrWalletProvider } from '@/providers/keplr';
import { leapWalletProvider } from '@/providers/leap';

export const WALLETS = [
  {
    label: 'keplr',
    logo: 'keplr',
    provider: keplrWalletProvider,
  },
  {
    label: 'cosmostation',
    logo: 'cosmostation',
    provider: cosmostationWalletProvider,
  },
  {
    label: 'leap',
    logo: 'leap',
    provider: leapWalletProvider,
  },
];
