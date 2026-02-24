import { tool } from 'ai';
import { z } from 'zod';
import logger from '@/logger';
import ChainService from '@/services/chain-service';
import PriceHistoryService from '@/services/price-history-service';
import TokenomicsService from '@/services/tokenomics-service';
import { toHumanTokens, resolveChain } from './utils';

const { logError } = logger('ai-tools:market');

export const marketTools = {
  getHistoricalData: tool({
    description:
      'Get historical price data for a blockchain token. Returns daily price points. Use when user asks about price history or price trends.',
    inputSchema: z.object({
        chainName: z.string().describe('The chain name identifier, e.g. cosmoshub, polkadot, aztec'),
        days: z.number().optional().default(30).describe('Number of days of history to return (default 30, max 365)'),
    }),
    execute: async ({ chainName, days }) => {
      try {
        const chain = await resolveChain(chainName);
        if (!chain) {
          return { error: `Chain "${chainName}" not found` };
        }

        const chartData = await PriceHistoryService.getChartData(chain.id);

        if (chartData.length === 0) {
          return { chainName: chain.prettyName, prices: [], message: 'No price history available for this chain' };
        }

        // Take last N days
        const limitedDays = Math.min(days ?? 30, 365);
        const recentData = chartData.slice(-limitedDays);

        return {
          chainName: chain.prettyName,
          denom: chain.params?.denom ?? null,
          dataPoints: recentData.length,
          prices: recentData,
        };
      } catch (error) {
        logError(`getHistoricalData failed for "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get historical data for chain "${chainName}"` };
      }
    },
  }),

  getTokenomics: tool({
    description:
      'Get tokenomics data for a blockchain including total supply, bonded tokens, inflation rate, and APR. Use when user asks about token economics.',
    inputSchema: z.object({
        chainName: z.string().describe('The chain name identifier, e.g. cosmoshub, polkadot, aztec'),
    }),
    execute: async ({ chainName }) => {
      try {
        const chain = await resolveChain(chainName);
        if (!chain) {
          return { error: `Chain "${chainName}" not found` };
        }

        const tokenomics = await TokenomicsService.getTokenomicsByChainId(chain.id);
        if (!tokenomics) {
          return { chainName: chain.prettyName, error: 'Tokenomics data not available for this chain' };
        }

        const price = await ChainService.getTokenPriceByChainId(chain.id);

        const decimals = chain.params?.coinDecimals ?? null;
        const denom = chain.params?.denom ?? null;

        return {
          chainName: chain.prettyName,
          denom,
          totalSupply: toHumanTokens(tokenomics.totalSupply, decimals),
          bondedTokens: toHumanTokens(tokenomics.bondedTokens, decimals),
          inflation: tokenomics.inflation,
          apr: tokenomics.apr,
          fdv: tokenomics.fdv,
          currentPrice: price?.value ?? null,
          unit: denom ? `Values in ${denom}` : null,
        };
      } catch (error) {
        logError(`getTokenomics failed for "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get tokenomics for chain "${chainName}"` };
      }
    },
  }),
};
