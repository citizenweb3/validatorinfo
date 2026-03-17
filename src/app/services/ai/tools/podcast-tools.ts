import { tool, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import logger from '@/logger';
import podcastService from '@/services/podcast-service';
import { PODCAST_EMBEDDING_MODEL_ID, PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';

const { logError } = logger('ai-tools:knowledge-base');

const EMBEDDING_MODEL = google.textEmbeddingModel(PODCAST_EMBEDDING_MODEL_ID);

const embedQuery = async (query: string): Promise<number[]> => {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: query,
    providerOptions: { google: { taskType: 'RETRIEVAL_QUERY', outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS } },
  });
  return embedding;
};

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
        const embedding = await embedQuery(query);
        const OVERFETCH = 40;
        const RESULT_LIMIT = 15;
        const MAX_PER_SOURCE = 2;

        const raw = await podcastService.searchChunks(embedding, OVERFETCH, validatorId, speakerRole);

        if (raw.length === 0) {
          return { results: [], message: 'No relevant knowledge base content found for this query.' };
        }

        const episodeCounts = new Map<string, number>();
        const deduped = raw.filter((r) => {
          const key = r.episodeSlug;
          const count = episodeCounts.get(key) || 0;
          if (count >= MAX_PER_SOURCE) return false;
          episodeCounts.set(key, count + 1);
          return true;
        });

        const results = deduped.slice(0, RESULT_LIMIT);

        const mapped = results.map((r) => ({
          quote: r.content,
          context: r.question,
          speakerRole: r.speakerRole,
          speakerName: r.speakerRole === 'HOST' ? 'Citizen Web3' : (r.speakerName || r.guestName),
          validatorId: r.validatorId,
          validatorMoniker: r.validatorMoniker,
          mentionedEntities: r.mentionedEntities,
          episodeTitle: r.episodeTitle,
          episodeUrl: r.episodeUrl,
          similarity: Math.round(r.similarity * 100) / 100,
        }));

        return { results: mapped };
      } catch (error) {
        logError(`searchKnowledgeBase failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: 'Failed to search knowledge base' };
      }
    },
  }),
};
