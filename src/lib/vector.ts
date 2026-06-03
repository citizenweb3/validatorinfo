import { PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';

export const validateEmbedding = (embedding: number[], label = 'embedding'): void => {
  if (embedding.length !== PODCAST_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `${label} must have ${PODCAST_EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
    );
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error(`${label} contains non-finite values`);
  }
};

export const l2Normalize = (embedding: number[], label = 'embedding'): number[] => {
  validateEmbedding(embedding, label);

  const norm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) throw new Error(`${label} cannot be the zero vector`);

  return embedding.map((value) => value / norm);
};

export const toPgVector = (embedding: number[]): string => {
  validateEmbedding(embedding);
  return `[${embedding.join(',')}]`;
};
