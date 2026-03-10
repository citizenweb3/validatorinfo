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

  const chainIds = chains.map((chain) => chain.id);
  const priceMap = await chainService.getTokenPricesByChainIds(chainIds);

  const chainsWithData = chains.map((chain) => {
    const apr = chain.tokenomics?.apr ?? 0;

    return {
      id: chain.id,
      name: chain.name,
      prettyName: chain.prettyName,
      logoUrl: chain.logoUrl,
      apr,
      tokenPrice: priceMap.get(chain.id) ?? 0,
      denom: chain.params?.denom ?? '',
    };
  });

  return chainsWithData.filter((c) => c.apr > 0);
};
