import { tool } from 'ai';
import { z } from 'zod';

import logger from '@/logger';
import valueSearchService from '@/services/value-search-service';

const { logError } = logger('ai-tools:values');

export const valueTools = {
  findValidatorsByValues: tool({
    description:
      'Find validators by values, infrastructure style, operating philosophy, or mission fit. Use this when the user asks for privacy-focused validators, decentralization-minded validators, bare-metal operators, or validators on a specific chain that match a value or operating approach. Returns candidate validators with knowledge-base evidence and their current network metrics.',
    inputSchema: z.object({
      query: z.string().describe('Value-oriented search query, e.g. "privacy focused validators" or "bare metal operators on Cosmos"'),
      chainName: z.string().optional().describe('Optional chain filter, e.g. cosmoshub, namada, polkadot'),
      limit: z.number().optional().default(5).describe('Maximum number of validators to return (default 5, max 10)'),
      speakerRole: z.enum(['GUEST', 'HOST', 'ALL']).optional()
        .describe('Optional source filter: ALL (default) includes both guest and host evidence, GUEST only guest evidence, HOST only Citizen Web3 host evidence'),
    }),
    execute: async ({ query, chainName, limit, speakerRole }) => {
      try {
        return await valueSearchService.findValidatorsByValues({
          query,
          chainName,
          limit,
          speakerRole,
        });
      } catch (error) {
        logError(`findValidatorsByValues failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: 'Failed to discover validators by values' };
      }
    },
  }),
};
