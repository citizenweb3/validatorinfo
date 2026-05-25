import { embed } from 'ai';
import { embeddingModel } from '@/services/ai/vertex-provider';
import { l2Normalize } from '@/lib/vector';
import logger from '@/logger';

import { PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';

const { logError } = logger('embedding-service');

const embedQuery = async (query: string): Promise<number[]> => {
  try {
    const { embedding } = await embed({
      model: embeddingModel(),
      value: query,
      providerOptions: {
        vertex: {
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
        },
      },
    });

    return l2Normalize(embedding);
  } catch (error) {
    logError('embedQuery failed', error);
    throw error;
  }
};

const EmbeddingService = {
  embedQuery,
};

export default EmbeddingService;
