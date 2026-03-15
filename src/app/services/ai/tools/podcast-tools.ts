import { tool, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import logger from '@/logger';
import podcastService from '@/services/podcast-service';
import { PODCAST_EMBEDDING_MODEL_ID, PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';

const { logError } = logger('ai-tools:podcast');

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
  searchPodcastInsights: tool({
    description:
      'Search Citizen Web3 podcast transcripts (~150+ episodes) for opinions, values, insights and quotes from validators, networks, projects, and people in the blockchain ecosystem. Use when user asks about opinions, values, beliefs, positions, or philosophy of any ecosystem participant.',
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
        const MAX_PER_EPISODE = 2; // best GUEST + best HOST per episode

        const raw = await podcastService.searchChunks(embedding, OVERFETCH, validatorId, speakerRole);

        if (raw.length === 0) {
          return { results: [], message: 'No relevant podcast content found for this query.' };
        }

        const MAX_HOST_TOTAL = 3;
        const episodeCounts = new Map<string, { guest: number; host: number }>();
        let totalHost = 0;
        const deduped = raw.filter((r) => {
          const key = r.episodeSlug;
          const counts = episodeCounts.get(key) || { guest: 0, host: 0 };
          const isHost = r.speakerRole === 'HOST';

          if (isHost && (counts.host >= 1 || totalHost >= MAX_HOST_TOTAL)) return false;
          if (!isHost && counts.guest >= (MAX_PER_EPISODE - 1)) return false;

          if (isHost) { counts.host++; totalHost++; }
          else counts.guest++;
          episodeCounts.set(key, counts);
          return true;
        });

        const results = deduped.slice(0, RESULT_LIMIT);

        const mapResult = (r: (typeof results)[number]) => ({
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
        });

        const hostEntries = results.filter((r) => r.speakerRole === 'HOST');
        const guestEntries = results.filter((r) => r.speakerRole !== 'HOST');
        const mapped = [...hostEntries, ...guestEntries].map(mapResult);

        return { results: mapped };
      } catch (error) {
        logError(`searchPodcastInsights failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: 'Failed to search podcast insights' };
      }
    },
  }),
};
