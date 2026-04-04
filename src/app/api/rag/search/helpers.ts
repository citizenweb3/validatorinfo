import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

export const OVERFETCH_LIMIT = 40;

const VALID_SPEAKER_ROLES = ['GUEST', 'HOST', 'ALL'] as const;

export type SpeakerRole = (typeof VALID_SPEAKER_ROLES)[number];

export interface RagSearchResponse {
  results: RagSearchResult[];
  message?: string;
}

export interface RagSearchResult {
  quote: string;
  context: string | null;
  speakerRole: string;
  speakerName: string | null;
  validatorId: number | null;
  validatorMoniker: string | null;
  mentionedEntities: string[];
  episodeTitle: string;
  episodeUrl: string;
  similarity: number;
}

export const parseLimit = (value: string | null): number => {
  if (!value) {
    return DEFAULT_LIMIT;
  }

  const parsedLimit = Number(value);
  if (!Number.isFinite(parsedLimit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(parsedLimit), 1), MAX_LIMIT);
};

export const parseSpeakerRole = (value: string | null): SpeakerRole | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (!VALID_SPEAKER_ROLES.includes(normalized as SpeakerRole)) {
    return null;
  }

  return normalized as SpeakerRole;
};

export const parseValidatorId = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsedId = Number(value);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
};

const NOT_FOUND = { ok: false as const, status: 404, error: 'This page could not be found.' };

export const authorizeRequest = (
  request: NextRequest,
): { ok: true } | { ok: false; status: number; error: string } => {
  const configuredToken = process.env.RAG_API_TOKEN;
  if (!configuredToken) {
    return NOT_FOUND;
  }

  const providedToken = request.headers.get('x-rag-api-token');
  if (!providedToken) {
    return NOT_FOUND;
  }

  const a = Buffer.from(providedToken);
  const b = Buffer.from(configuredToken);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NOT_FOUND;
  }

  return { ok: true };
};
