import { ChainItem } from '@/types';
import chainService from '@/services/chain-service';

export const getChains = async (): Promise<ChainItem[]> => {
  const { chains } = await chainService.getAll([], 0, 100, 'name', 'asc');
  const chainsWithPrices = await Promise.all(
    chains.map(async (chain) => {
      const price = await chainService.getTokenPriceByChainId(chain.id);
      return {
        id: chain.id,
        name: chain.prettyName,
        asset: {
          name: chain.prettyName,
          symbol: chain.params?.denom ?? '',
          isSymbolFirst: false,
          price: price?.value ?? 1,
        },
      };
    }),
  );
  return Promise.resolve(chainsWithPrices);
};
