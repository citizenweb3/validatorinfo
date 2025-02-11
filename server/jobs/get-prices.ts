import logger from '@/logger';
import priceService from '@/services/price-service';

import { ChainWithNodes } from '../types';

const { logInfo, logError, logDebug } = logger('get-prices');

export const getPrices = async (chains: ChainWithNodes[]) => {
  try {
    const chainsForPrices = chains.filter((c) => c.coinGeckoId);
    const req =
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
      chainsForPrices.map((chain) => chain.coinGeckoId).join(',') +
      '&vs_currencies=usd';

    logInfo(`Get prices from Coingecko by ${req}`);

    const prices = await fetch(req).then((data) => data.json());
    for (const chain of chains) {
      if (prices[chain.coinGeckoId]?.usd) {
        await priceService.addPrice(chain, prices[chain.coinGeckoId].usd);
      }
    }
  } catch (e) {
    logError("Can't fetch prices: ", e);
  }
};
