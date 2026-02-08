import { sleep } from '@cosmjs/utils';

import db from '@/db';
import logger from '@/logger';
import { chainParamsArray } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('get-price-history');

interface MarketChartResponse {
  prices?: [number, number][];
}

const RETRIES = 5;
const REQUEST_DELAY = 1500;
const RETRY_DELAY = 5000;
const TOO_MANY_REQUESTS_DELAY = 60_000;

const toUTCDate = (timestamp: number): Date => {
  const d = new Date(timestamp);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const processChainWithRetry = async (chain: { chainId: string; coinGeckoId: string }, retries = RETRIES) => {
  const dbChain = await db.chain.findFirst({
    where: { chainId: chain.chainId },
  });
  if (!dbChain) {
    logError(`Chain ${chain.chainId} not found in database`);
    return;
  }

  const lastPriceHistory = await db.priceHistory.findFirst({
    where: { chainId: dbChain.id },
    orderBy: { date: 'desc' },
  });

  const firstPrice = await db.price.findFirst({
    where: { chainId: dbChain.id },
    orderBy: { createdAt: 'asc' },
  });

  const lastDate = lastPriceHistory ? lastPriceHistory.date : null;
  const firstPriceDate = firstPrice
    ? new Date(Date.UTC(firstPrice.createdAt.getUTCFullYear(), firstPrice.createdAt.getUTCMonth(), firstPrice.createdAt.getUTCDate()))
    : null;

  if (lastDate && firstPriceDate && lastDate >= firstPriceDate) {
    logInfo(`[${chain.chainId}] No gap between PriceHistory and Price, skipping.`);
    return;
  }

  if (lastDate && !firstPriceDate) {
    logInfo(`[${chain.chainId}] PriceHistory exists but no Price records, skipping.`);
    return;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${chain.coinGeckoId}/market_chart?vs_currency=usd&days=365&interval=daily`;
      const response = await fetch(url);

      if (response.status === 429) {
        logError(`[${chain.chainId}] 429 Too Many Requests, waiting ${TOO_MANY_REQUESTS_DELAY / 1000}s`);
        await sleep(TOO_MANY_REQUESTS_DELAY);
        continue;
      }

      if (!response.ok) {
        logError(`[${chain.chainId}] Bad response: ${response.status}`);
        await sleep(RETRY_DELAY);
        continue;
      }

      const data: MarketChartResponse = await response.json();
      if (!data.prices || data.prices.length === 0) {
        logInfo(`[${chain.chainId}] No price data returned from CoinGecko.`);
        return;
      }

      const points = data.prices
        .filter(([, value]) => Number.isFinite(value) && value >= 0)
        .map(([timestamp, value]) => ({
          date: toUTCDate(timestamp),
          value,
        }))
        .filter((point) => {
          if (lastDate && point.date <= lastDate) return false;
          if (firstPriceDate && point.date >= firstPriceDate) return false;
          return true;
        });

      if (points.length === 0) {
        logInfo(`[${chain.chainId}] No new points to insert after filtering.`);
        return;
      }

      await db.$transaction(
        points.map((point) =>
          db.priceHistory.upsert({
            where: {
              chainId_date: {
                chainId: dbChain.id,
                date: point.date,
              },
            },
            create: {
              chainId: dbChain.id,
              value: point.value,
              date: point.date,
            },
            update: {
              value: point.value,
            },
          }),
        ),
      );

      logInfo(`[${chain.chainId}] Inserted ${points.length} price history points.`);
      return;
    } catch (e) {
      logError(`[${chain.chainId}] Error:`, e);
      if (i === retries - 1) {
        logError(`[${chain.chainId}] Couldn't update after ${retries} retries.`);
      } else {
        await sleep(RETRY_DELAY);
      }
    }
  }
};

export const getPriceHistory = async () => {
  const chains = chainParamsArray.filter((c) => c.coinGeckoId);

  for (const chain of chains) {
    await processChainWithRetry(chain);
    await sleep(REQUEST_DELAY);
  }
};
