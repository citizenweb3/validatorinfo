import { cosmostationWalletProvider } from '@/providers/cosmostation';
import { keplrWalletProvider } from '@/providers/keplr';
import { leapWalletProvider } from '@/providers/leap';

export const WALLETS = [
  {
    label: 'keplr',
    logo: 'KeplrIcon',
    provider: keplrWalletProvider,
  },
  {
    label: 'cosmostation',
    logo: 'CosmostationIcon',
    provider: cosmostationWalletProvider,
  },
  {
    label: 'leap',
    logo: 'LeapIcon',
    provider: leapWalletProvider,
  },
];
