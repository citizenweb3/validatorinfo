import { tool } from 'ai';
import { z } from 'zod';
import logger from '@/logger';
import ChainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';
import { toHumanTokens, resolveChain } from './utils';
import { getChainValidatorCount } from './ai-data-helpers';

const { logError } = logger('ai-tools:validator');

const mapValidatorNode = (node: any) => ({
  chain: node.chain.prettyName,
  chainName: node.chain.name,
  operatorAddress: node.operatorAddress,
  jailed: node.jailed,
  commission: node.rate,
  uptime: node.uptime,
  missedBlocks: node.missedBlocks,
  delegatorsAmount: node.delegatorsAmount,
  denom: node.chain.params?.denom ?? null,
  apr: node.chain.tokenomics?.apr ?? null,
  currentPrice: node.chain.prices?.[0]?.value ?? null,
});

export const validatorTools = {
  getValidators: tool({
    description:
      'Get the list of validators for a specific blockchain network. Returns totalValidators (actual count in the network) and a list of top validators sorted by staked tokens (descending). Use when user asks about validators on a chain.',
    inputSchema: z.object({
        chainName: z.string().describe('The chain name identifier, e.g. cosmoshub, polkadot, aztec'),
        limit: z.number().optional().default(10).describe('Maximum number of validators to return (default 10, max 25)'),
    }),
    execute: async ({ chainName, limit }) => {
      try {
        const chain = await resolveChain(chainName);
        if (!chain) {
          return { error: `Chain "${chainName}" not found` };
        }

        const take = Math.min(limit ?? 10, 25);
        const decimals = chain.params?.coinDecimals ?? null;
        const denom = chain.params?.denom ?? null;
        const [{ validators }, totalValidators] = await Promise.all([
          ChainService.getChainValidatorsWithNodes(chain.id, [], 0, take, 'tokens', 'desc'),
          getChainValidatorCount(chain.id, chain.name),
        ]);

        return {
          chainName: chain.prettyName,
          denom,
          totalValidators,
          validators: validators.map((v) => ({
            validatorId: v.validatorId,
            moniker: v.validator?.moniker ?? v.moniker,
            operatorAddress: v.operatorAddress,
            votingPower: v.votingPower,
            tokens: toHumanTokens(v.tokens, decimals),
            jailed: v.jailed,
            commission: v.rate,
            uptime: v.uptime,
            missedBlocks: v.missedBlocks,
            delegatorsAmount: v.delegatorsAmount,
          })),
        };
      } catch (error) {
        logError(`getValidators failed for "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get validators for chain "${chainName}"` };
      }
    },
  }),

  searchValidators: tool({
    description:
      'Search for validators by name (moniker). Returns FULL data per validator: id, moniker, identity, and for EACH network they operate on: uptime, commission, missedBlocks, tokens, delegators, APR, price. Use this to compare validators — all metrics are included in the response. Call it once per validator name.',
    inputSchema: z.object({
      query: z.string().describe('Validator name or part of the name to search for'),
    }),
    execute: async ({ query }) => {
      try {
        const results = await ValidatorService.searchByMoniker(query);

        if (results.length === 0) {
          return { query, total: 0, validators: [], message: `No validators found matching "${query}"` };
        }

        return {
          query,
          total: results.length,
          validators: results.map((v) => ({
            id: v.id,
            moniker: v.moniker,
            identity: v.identity,
            website: v.website,
            networks: v.nodes.map((n) => ({
              chain: n.chain.prettyName,
              chainName: n.chain.name,
              operatorAddress: n.operatorAddress,
              jailed: n.jailed,
              commission: n.rate,
              uptime: n.uptime,
              missedBlocks: n.missedBlocks,
              tokens: toHumanTokens(n.tokens, n.chain.params?.coinDecimals),
              delegatorsAmount: n.delegatorsAmount,
              denom: n.chain.params?.denom ?? null,
              apr: n.chain.tokenomics?.apr ?? null,
              currentPrice: n.chain.prices?.[0]?.value ?? null,
            })),
          })),
        };
      } catch (error) {
        logError(`searchValidators failed for "${query}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to search validators for "${query}"` };
      }
    },
  }),

  getValidatorById: tool({
    description:
      'Get validator information by their numeric database ID. Use when the user is on a validator profile page and you have the numeric ID from page context. Returns full data: moniker, identity, and for each network: uptime, commission, missedBlocks, tokens, delegators, APR, price.',
    inputSchema: z.object({
      id: z.number().describe('The numeric validator ID from the database'),
    }),
    execute: async ({ id }) => {
      try {
        const validator = await ValidatorService.getById(id);
        if (!validator) {
          return { error: `Validator with ID ${id} not found` };
        }

        const details = await ValidatorService.getByIdentityWithDetails(validator.identity);
        if (!details) {
          return { id, moniker: validator.moniker, identity: validator.identity, nodes: [] };
        }

        return {
          id: details.id,
          moniker: details.moniker,
          identity: details.identity,
          nodes: details.nodes.map(mapValidatorNode),
        };
      } catch (error) {
        logError(`getValidatorById failed for ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get validator with ID ${id}` };
      }
    },
  }),

  getValidatorDetails: tool({
    description:
      'Get detailed information about a specific validator by their identity (keybase identity string). Shows their nodes across chains, commission, uptime, etc. Use searchValidators first if you only have the validator name.',
    inputSchema: z.object({
        identity: z.string().describe('The validator identity string (keybase identity)'),
    }),
    execute: async ({ identity }) => {
      try {
        const validator = await ValidatorService.getByIdentityWithDetails(identity);
        if (!validator) {
          return { error: `Validator with identity "${identity}" not found` };
        }

        return {
          id: validator.id,
          moniker: validator.moniker,
          identity: validator.identity,
          nodes: validator.nodes.map(mapValidatorNode),
        };
      } catch (error) {
        logError(`getValidatorDetails failed for identity "${identity}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get validator details for identity "${identity}"` };
      }
    },
  }),
};
