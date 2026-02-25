import { tool } from 'ai';
import { z } from 'zod';
import logger from '@/logger';
import ChainService from '@/services/chain-service';
import SearchService from '@/services/search-service';
import { toHumanTokens, resolveChain } from './utils';

const { logError } = logger('ai-tools:chain');

export const chainTools = {
  getChainMetrics: tool({
    description:
      'Get metrics for a blockchain network including APR, TVL, price, token info, and chain parameters. Use this when the user asks about a specific chain/network.',
    inputSchema: z.object({
        chainName: z.string().describe('The chain name identifier, e.g. cosmoshub, polkadot, aztec, osmosis, celestia'),
    }),
    execute: async ({ chainName }) => {
      try {
        const chain = await resolveChain(chainName);
        if (!chain) {
          return { error: `Chain "${chainName}" not found. Try using searchChains to find the correct name.` };
        }

        const price = await ChainService.getTokenPriceByChainId(chain.id);
        const tokenomics = chain.tokenomics;

        const decimals = chain.params?.coinDecimals ?? null;
        const denom = chain.params?.denom ?? null;

        return {
          name: chain.prettyName,
          chainId: chain.chainId,
          ecosystem: chain.ecosystem,
          denom,
          apr: tokenomics?.apr ?? null,
          totalSupply: toHumanTokens(tokenomics?.totalSupply, decimals),
          bondedTokens: toHumanTokens(tokenomics?.bondedTokens, decimals),
          inflation: tokenomics?.inflation ?? null,
          fdv: tokenomics?.fdv ?? null,
          currentPrice: price?.value ?? null,
          unit: denom ? `Values in ${denom}` : null,
        };
      } catch (error) {
        logError(`getChainMetrics failed for "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get metrics for chain "${chainName}"` };
      }
    },
  }),

  compareChains: tool({
    description:
      'Compare metrics (APR, price, TVL, inflation) across two or more blockchain networks. Use this when the user asks to compare chains.',
    inputSchema: z.object({
        chainNames: z
          .array(z.string())
          .min(2)
          .describe('Array of chain name identifiers to compare, e.g. ["cosmoshub", "osmosis"]'),
    }),
    execute: async ({ chainNames }) => {
      try {
        const results = await Promise.all(
          chainNames.map(async (name) => {
            const chain = await ChainService.getByName(name);
            if (!chain) return { name, error: `Chain "${name}" not found` };

            const price = await ChainService.getTokenPriceByChainId(chain.id);
            const tokenomics = chain.tokenomics;

            return {
              name: chain.prettyName,
              chainName: chain.name,
              ecosystem: chain.ecosystem,
              denom: chain.params?.denom ?? null,
              apr: tokenomics?.apr ?? null,
              inflation: tokenomics?.inflation ?? null,
              fdv: tokenomics?.fdv ?? null,
              currentPrice: price?.value ?? null,
            };
          }),
        );

        return { chains: results };
      } catch (error) {
        logError(`compareChains failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: 'Failed to compare chains' };
      }
    },
  }),

  searchChains: tool({
    description:
      'Search for chains, validators, and tokens by name or keyword. Use this when the user mentions a chain name you are not sure about or wants to find something.',
    inputSchema: z.object({
        query: z.string().describe('Search query string, e.g. "cosmos", "atom", "polkadot"'),
    }),
    execute: async ({ query }) => {
      try {
        const results = await SearchService.findAll(query);
        return {
          chains: results.chains.map((c) => ({ id: c.id, name: c.name, prettyName: c.prettyName })),
          validators: results.validators.map((v) => ({ id: v.id, moniker: v.moniker, identity: v.identity })),
        };
      } catch (error) {
        logError(`searchChains failed for "${query}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Search failed for query "${query}"` };
      }
    },
  }),

  getEcosystemChains: tool({
    description: 'Get a list of all available blockchain networks with basic info. Use when user asks about available networks or wants an overview.',
    inputSchema: z.object({
        ecosystem: z
          .string()
          .optional()
          .describe('Optional ecosystem filter, e.g. "cosmos", "polkadot", "ethereum"'),
    }),
    execute: async ({ ecosystem }) => {
      try {
        const ecosystems = ecosystem ? [ecosystem] : [];
        const { chains } = await ChainService.getAll(ecosystems, 0, 50, 'prettyName', 'asc');

        return {
          total: chains.length,
          chains: chains.map((c) => ({
            name: c.name,
            prettyName: c.prettyName,
            ecosystem: c.ecosystem,
            apr: c.tokenomics?.apr ?? null,
          })),
        };
      } catch (error) {
        logError(`getEcosystemChains failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: 'Failed to get chains list' };
      }
    },
  }),
};
