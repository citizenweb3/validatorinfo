import db from '@/db';
import logger from '@/logger';
import { chainParamsArray } from '@/server/tools/chains/params';
import { sleep } from '@cosmjs/utils';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';

const { logInfo, logError } = logger('get-tokenomics');

interface MarketData {
  price_change_percentage_24h?: number | null;
  price_change_percentage_30d?: number | null;
  price_change_percentage_1y?: number | null;
  ath?: { usd?: number | null };
  atl?: { usd?: number | null };
}

interface ApiResponse {
  id?: string;
  market_data?: MarketData;
}

const RETRIES = 5;
const REQUEST_DELAY = 1500;
const RETRY_DELAY = 5000;
const TOO_MANY_REQUESTS_DELAY = 60_000;

const processChainWithRetry = async (chain: AddChainProps, retries = RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${chain.coinGeckoId}`);
      if (response.status === 429) {
        logError(`[${chain.chainId}] 429 Too Many Requests, waiting ${TOO_MANY_REQUESTS_DELAY / 1000}s`);
        await sleep(TOO_MANY_REQUESTS_DELAY);
        continue;
      }
      if (!response.ok) {
        logError(`Bad response: ${response.status}`);
        continue;
      }

      const data: ApiResponse = await response.json();
      if (!data || !data.market_data) {
        logError('No market_data');
      }

      const dbChain = await db.chain.findFirst({
        where: { chainId: chain.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chain.chainId} not found in database`);
        continue;
      }

      const marketData = data.market_data;
      const record = {
        changesPerDay: Number(marketData?.price_change_percentage_24h) || 0,
        changesPerMonth: Number(marketData?.price_change_percentage_30d) || 0,
        changesPerYear: Number(marketData?.price_change_percentage_1y) || 0,
        ath: Number(marketData?.ath?.usd) || 0,
        atl: Number(marketData?.atl?.usd) || 0,
      };
      await db.tokenomics.upsert({
        where: { chainId: dbChain.id },
        create: { chainId: dbChain.id, ...record },
        update: { ...record },
      });
      logInfo(`[${chain.chainId}] Updated successfully.`);
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

export const getTokenomics = async () => {
  const chains = chainParamsArray.filter((c) => c.coinGeckoId);

  for (const chain of chains) {
    await processChainWithRetry(chain);
    await sleep(REQUEST_DELAY);
  }
};
