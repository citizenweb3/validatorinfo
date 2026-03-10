'use server';

import chainService from '@/services/chain-service';

export interface SimulatorChainData {
  id: number;
  name: string;
  prettyName: string;
  logoUrl: string;
  apr: number;
  tokenPrice: number;
  denom: string;
}

export const getSimulatorChains = async (): Promise<SimulatorChainData[]> => {
  const { chains } = await chainService.getAll([], 0, 200, 'name', 'asc');

  const chainsWithData = await Promise.all(
    chains.map(async (chain) => {
      const price = await chainService.getTokenPriceByChainId(chain.id);
      const apr = chain.tokenomics?.apr ?? 0;

      return {
        id: chain.id,
        name: chain.name,
        prettyName: chain.prettyName,
        logoUrl: chain.logoUrl,
        apr,
        tokenPrice: price?.value ?? 0,
        denom: chain.params?.denom ?? '',
      };
    }),
  );

  return chainsWithData.filter((c) => c.apr > 0);
};
