import { NextRequest, NextResponse } from 'next/server';

import logger from '@/logger';
import podcastService from '@/services/podcast-service';

import { authorizeRequest, OVERFETCH_LIMIT, parseLimit, parseSpeakerRole, parseValidatorId, RagSearchResponse } from './helpers';
import EmbeddingService from '@/services/embedding-service';

const { logError } = logger('api:rag-search');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authorization = authorizeRequest(request);
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required and must be a non-empty string' },
      { status: 400 },
    );
  }

  const limit = parseLimit(request.nextUrl.searchParams.get('limit'));

  const speakerRole = parseSpeakerRole(request.nextUrl.searchParams.get('speaker'));
  if (request.nextUrl.searchParams.has('speaker') && !speakerRole) {
    return NextResponse.json(
      { error: 'Query parameter "speaker" must be one of: GUEST, HOST, ALL' },
      { status: 400 },
    );
  }

  const validatorId = parseValidatorId(request.nextUrl.searchParams.get('validatorId'));
  if (request.nextUrl.searchParams.has('validatorId') && validatorId === null) {
    return NextResponse.json(
      { error: 'Query parameter "validatorId" must be a positive integer' },
      { status: 400 },
    );
  }

  try {
    const embedding = await EmbeddingService.embedQuery(query);
    const rawResults = await podcastService.searchChunks(
      embedding, OVERFETCH_LIMIT, validatorId ?? undefined, speakerRole ?? undefined,
    );

    const body: RagSearchResponse = rawResults.length === 0
      ? { results: [], message: 'No relevant knowledge base content found for this query.' }
      : { results: podcastService.formatSearchResults(rawResults, limit) };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    logError(`RAG search failed: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 });
  }
}
