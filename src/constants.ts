import { keplrWalletProvider } from '@/providers/keplr';
import { cosmostationWalletProvider } from '@/providers/cosmostation';
import { leapWalletProvider } from '@/providers/leap';


export const WALLETS = [
  {
    label: "Keplr",
    logo: "KeplrIcon",
    provider: keplrWalletProvider,
  },
  {
    label: "Cosmostation",
    logo: "CosmostationIcon",
    provider: cosmostationWalletProvider,
  },
  {
    label: "Leap",
    logo: "LeapIcon",
    provider: leapWalletProvider,
  },
];