import { ChainItem } from '@/types';

export const getChains = async (): Promise<ChainItem[]> => {
  const chains: ChainItem[] = [
    {
      id: 0,
      name: 'Cosmos',
      asset: {
        name: 'ATOM',
        symbol: 'ATOM',
        isSymbolFirst: false,
        price: 9.9,
      },
    },
    {
      id: 1,
      name: 'Polkadot',
      asset: {
        name: 'DOT',
        symbol: 'DOT',
        isSymbolFirst: false,
        price: 6.5,
      },
    },
    {
      id: 2,
      name: 'Ethereum',
      asset: {
        name: 'ETH',
        symbol: 'ETH',
        isSymbolFirst: false,
        price: 2600.9,
      },
    },
    {
      id: 3,
      name: 'Bitcoin',
      asset: {
        name: 'BTC',
        symbol: 'BTC',
        isSymbolFirst: false,
        price: 71000,
      },
    },
    {
      id: 4,
      name: 'Avalanche',
      asset: {
        name: 'AVAX',
        symbol: 'AVAX',
        isSymbolFirst: false,
        price: 31.9,
      },
    },
  ];

  return Promise.resolve(chains);
};
