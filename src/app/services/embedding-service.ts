import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import logger from '@/logger';

import { PODCAST_EMBEDDING_DIMENSIONS, PODCAST_EMBEDDING_MODEL_ID } from '@/server/config/podcast-config';

const { logError } = logger('embedding-service');

const EMBEDDING_MODEL = google.textEmbeddingModel(PODCAST_EMBEDDING_MODEL_ID);

const embedQuery = async (query: string): Promise<number[]> => {
  try {
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: query,
      providerOptions: {
        google: {
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
        },
      },
    });

    return embedding;
  } catch (error) {
    logError('embedQuery failed', error);
    throw error;
  }
};

const EmbeddingService = {
  embedQuery,
};

export default EmbeddingService;
