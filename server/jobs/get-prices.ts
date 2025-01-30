import db from '@/db';

import { ChainWithNodes } from '../types';

export const getPrices = async (chains: ChainWithNodes[]) => {
  try {
    const chainsForPrices = chains.filter((c) => c.coinGeckoId);
    const req =
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
      chainsForPrices.map((chain) => chain.coinGeckoId).join(',') +
      '&vs_currencies=usd';

    console.log(`Get prices from Coingecko by`, req);

    const prices = await fetch(req).then((data) => data.json());
    const date = new Date();
    for (const chain of chains) {
      if (prices[chain.coinGeckoId]?.usd) {
        await db.price.create({
          data: { chainId: chain.chainId, date: date, value: prices[chain.coinGeckoId].usd },
        });
      }
    }
  } catch (e) {
    console.log("Can't fetch prices: ", e);
  }
};
