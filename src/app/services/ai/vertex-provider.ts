import { createVertex } from '@ai-sdk/google-vertex';

import logger from '@/logger';

const { logDebug, logError } = logger('vertex-provider');

const VERTEX_PROJECT = process.env.GOOGLE_CLOUD_PROJECT?.trim() || undefined;
const VERTEX_LOCATION = 'global';
// Chat + summary: 3.5-flash GA (May 2026), agentic-optimized, supports function calling.
// Same model for both: unified quality, GA stability, no preview deprecation risk.
// Summary (indexer-side, one-off reindex) cost is negligible (~$15-20 for full 188-episode rebuild).
const CHAT_MODEL_ID = 'gemini-3.5-flash';
const SUMMARY_MODEL_ID = 'gemini-3.5-flash';
// Embedding: v001 stays for now — v2 is preview-locked on this GCP project (requires Google allowlist).
// When v2 becomes accessible, swap here AND trigger full reindex (vector spaces incompatible).
const EMBEDDING_MODEL_ID = 'gemini-embedding-001';

if (!VERTEX_PROJECT) {
  logError('GOOGLE_CLOUD_PROJECT is not set — Vertex AI provider will not initialize');
}

let cachedVertex: ReturnType<typeof createVertex> | null = null;

const getVertex = (): ReturnType<typeof createVertex> => {
  if (cachedVertex) return cachedVertex;

  cachedVertex = createVertex({
    project: VERTEX_PROJECT,
    location: VERTEX_LOCATION,
  });
  logDebug(`vertex-provider initialized: project=${VERTEX_PROJECT}, location=${VERTEX_LOCATION}`);

  return cachedVertex;
};

export const chatModel = () => getVertex()(CHAT_MODEL_ID);

export const summaryModel = () => getVertex()(SUMMARY_MODEL_ID);

export const embeddingModel = () => getVertex().textEmbeddingModel(EMBEDDING_MODEL_ID);

export const hasVertexConfig = (): boolean => Boolean(VERTEX_PROJECT);
