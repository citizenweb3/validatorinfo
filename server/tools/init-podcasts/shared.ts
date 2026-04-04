import path from 'path';

import { google } from '@ai-sdk/google';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import db from '@/db';
import logger from '@/logger';
import { PODCAST_EMBEDDING_DIMENSIONS, PODCAST_EMBEDDING_MODEL_ID } from '@/server/config/podcast-config';

// --- Logger ---

const { logInfo, logError, logWarn } = logger('init-podcasts');

// --- Re-exports ---

export { db, Prisma, z, logInfo, logError, logWarn };
export { PODCAST_EMBEDDING_DIMENSIONS, PODCAST_EMBEDDING_MODEL_ID };

// --- AI Models ---

export const EMBEDDING_MODEL = google.textEmbeddingModel(PODCAST_EMBEDDING_MODEL_ID);
export const SUMMARY_MODEL = google('gemini-2.5-flash');

// --- Podcast Constants ---

export const CHUNK_INSERT_BATCH_SIZE = 50;
export const CHUNK_MAX_WORDS = 500;
export const CHUNK_MIN_WORDS = 300;
export const CHUNK_OVERLAP_WORDS = 100;
export const HOST_ALIASES = ['citizen web3', 'citizenweb3', 'citizen cosmos', 'serj', 'anna'];
export const RATE_LIMIT_DELAY_MS = 2000;

export const HOST_IDENTITY = 'FA230088439F5B88';
export const HOST_MONIKER = 'Citizen Web3';

// --- Paths ---

export const DATA_DIR = path.join(__dirname, '../../data/podcasts');
export const INDEX_PATH = path.join(DATA_DIR, 'index.json');
export const TRANSCRIPTS_DIR = path.join(DATA_DIR, 'transcripts');

// --- CW3 Document Constants ---

export const CW3_DOCS_DIR = path.join(__dirname, '../../data/cw3-docs');
export const FETCH_TIMEOUT_MS = 10000;
export const DOC_CHUNK_MAX_WORDS = 300;
export const DOC_CHUNK_MIN_WORDS = 100;
export const DOC_CHUNK_OVERLAP_WORDS = 50;

// --- Interfaces ---

export interface IndexEntry {
  slug: string;
  title: string;
  description?: string;
  publicationDate?: string;
  duration?: string;
  playerUrl?: string;
  episodeUrl: string;
  guestName: string;
  moniker?: string;
  identity?: string;
  validatorId?: number | null;
  chainName?: string;
  speakerLabel?: string;
  multiGuest?: boolean;
}

export interface Segment {
  role: 'HOST' | 'GUEST';
  speakerName: string | null;
  text: string;
  wordCount: number;
}

export interface Chunk {
  content: string;
  question: string | null;
  speakerRole: 'HOST' | 'GUEST';
  speakerName: string | null;
  chunkIndex: number;
}

export interface CW3DocSource {
  slug: string;
  title: string;
  episodeUrl: string;
  fetchFn: () => Promise<string>;
  fallbackFile: string;
}

export interface DocChunk {
  content: string;
  heading: string;
  chunkIndex: number;
}

export interface EpisodeMeta {
  summary: string;
  primaryProject: string | null;
  mentionedEntities: string[];
}

// --- Zod Schemas ---

export const metadataSchema = z.object({
  primaryProject: z.string().nullable().describe('The main company/project/validator/protocol the guest represents. Use the ORGANIZATION name, not the person name. Examples: "Chorus One", "Celestia", "Sentinel". null if unclear.'),
  mentionedEntities: z.array(z.string()).describe('Other notable proper nouns mentioned: projects, networks, protocols, tools, people. Exclude the guest name and their primaryProject. Exclude generic concepts like "privacy" or "decentralization".'),
});

// --- Utility Functions ---

export const wordCount = (text: string): number => text.split(/\s+/).filter(Boolean).length;

export const splitWithOverlap = (text: string, maxWords: number, overlapWords: number): string[] => {
  if (overlapWords >= maxWords) throw new Error('overlapWords must be < maxWords');
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [text.trim()];

  const result: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    result.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
    start = end - overlapWords;
  }
  return result;
};
