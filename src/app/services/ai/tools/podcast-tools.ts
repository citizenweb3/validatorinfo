import { tool } from 'ai';
import { z } from 'zod';
import logger from '@/logger';
import podcastService from '@/services/podcast-service';
import EmbeddingService from '@/services/embedding-service';

const { logError } = logger('ai-tools:knowledge-base');

export const podcastTools = {
  searchKnowledgeBase: tool({
    description:
      'Search Citizen Web3 knowledge base: podcast transcripts (~150+ episodes), project documentation, manifesto, and infrastructure details. Use for opinions, values, beliefs, philosophy, or any questions about Citizen Web3 as a project and validator.',
    inputSchema: z.object({
      query: z.string().describe('Semantic search query, e.g. "privacy importance", "decentralization values"'),
      validatorId: z.number().optional().describe('Optional: limit search to specific validator'),
      speakerRole: z.enum(['GUEST', 'HOST', 'ALL']).optional()
        .describe('Filter by speaker: ALL (default) returns both guest and host, GUEST for guest-only, HOST for Citizen Web3 host-only'),
    }),
    execute: async ({ query, validatorId, speakerRole }) => {
      try {
        const embedding = await EmbeddingService.embedQuery(query);
        const OVERFETCH = 40;
        const RESULT_LIMIT = 15;

        const raw = await podcastService.searchChunks(embedding, OVERFETCH, validatorId, speakerRole);

        if (raw.length === 0) {
          return { results: [], message: 'No relevant knowledge base content found for this query.' };
        }

        return { results: podcastService.formatSearchResults(raw, RESULT_LIMIT) };
      } catch (error) {
        logError(`searchKnowledgeBase failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: 'Failed to search knowledge base' };
      }
    },
  }),
};
