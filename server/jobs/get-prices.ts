import db from '@/db';
import logger from '@/logger';
import { chainParamsArray } from '@/server/tools/chains/params';
import priceService from '@/services/price-service';

const { logInfo, logError } = logger('get-prices');

export const getPrices = async () => {
  try {
    const chainsForPrices = chainParamsArray.filter((c) => c.coinGeckoId);
    const req =
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
      chainsForPrices.map((chain) => chain.coinGeckoId).join(',') +
      '&vs_currencies=usd';

    logInfo(`Get prices from Coingecko by ${req}`);

    const prices = await fetch(req).then((data) => data.json());
    for (const chain of chainParamsArray) {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chain.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chain.chainId} not found in database`);
        continue;
      }
      if (prices[chain.coinGeckoId]?.usd) {
        await priceService.addPrice(dbChain, prices[chain.coinGeckoId].usd);
      }
    }
  } catch (e) {
    logError("Can't fetch prices: ", e);
  }
};
