import { Prisma } from '@prisma/client';
import db from '@/db';
import logger from '@/logger';
import { PODCAST_EMBEDDING_DIMENSIONS } from '@/server/config/podcast-config';

const { logError } = logger('podcast-service');

interface PodcastChunkResult {
  id: number;
  content: string;
  question: string | null;
  contextPrefix: string | null;
  speakerRole: string;
  speakerName: string | null;
  chunkIndex: number;
  episodeTitle: string;
  episodeUrl: string;
  episodeSlug: string;
  guestName: string;
  validatorId: number | null;
  chainName: string | null;
  chainPrettyName: string | null;
  chainId: number | null;
  primaryProject: string | null;
  mentionedEntities: string[];
  validatorMoniker: string | null;
  similarity: number;
}

interface EpisodeSummaryResult {
  summary: string;
  episodeUrl: string;
  title: string;
}

const podcastService = {
  async getEpisodeSummaryByValidator(
    identity: string,
    moniker: string,
  ): Promise<EpisodeSummaryResult | null> {
    try {
      const HOST_IDENTITY = 'FA230088439F5B88';
      const HOST_MONIKER = 'Citizen Web3';
      const isHost = identity === HOST_IDENTITY
        || (moniker && HOST_MONIKER.toLowerCase() === moniker.toLowerCase());
      if (isHost) {
        const hostMeta = await db.podcastEpisode.findFirst({
          where: { slug: '__host_meta__', summary: { not: null } },
          select: { summary: true, episodeUrl: true, title: true },
        });
        if (hostMeta?.summary) {
          return { summary: hostMeta.summary, episodeUrl: hostMeta.episodeUrl, title: hostMeta.title };
        }
      }

      if (identity && identity.trim() !== '') {
        const episode = await db.podcastEpisode.findFirst({
          where: { identity, summary: { not: null }, slug: { not: '__host_meta__' } },
          select: { summary: true, episodeUrl: true, title: true },
        });
        if (episode?.summary) {
          return { summary: episode.summary, episodeUrl: episode.episodeUrl, title: episode.title };
        }
      }

      if (moniker) {
        const episode = await db.podcastEpisode.findFirst({
          where: {
            moniker: { equals: moniker, mode: 'insensitive' },
            summary: { not: null },
            slug: { not: '__host_meta__' },
          },
          select: { summary: true, episodeUrl: true, title: true },
        });
        if (episode?.summary) {
          return { summary: episode.summary, episodeUrl: episode.episodeUrl, title: episode.title };
        }
      }

      if (moniker) {
        const episode = await db.podcastEpisode.findFirst({
          where: {
            primaryProject: { equals: moniker, mode: 'insensitive' },
            summary: { not: null },
            slug: { not: '__host_meta__' },
          },
          select: { summary: true, episodeUrl: true, title: true },
        });
        if (episode?.summary) {
          return { summary: episode.summary, episodeUrl: episode.episodeUrl, title: episode.title };
        }
      }

      return null;
    } catch (error) {
      logError(`getEpisodeSummaryByValidator failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  },

  async searchChunks(
    embedding: number[],
    limit: number,
    validatorId?: number,
    speakerRole?: 'GUEST' | 'HOST' | 'ALL',
  ): Promise<PodcastChunkResult[]> {
    if (embedding.length !== PODCAST_EMBEDDING_DIMENSIONS || !embedding.every(v => Number.isFinite(v))) {
      logError(`Invalid embedding: length=${embedding.length}`);
      return [];
    }

    try {
      const vectorStr = `[${embedding.join(',')}]`;

      const effectiveRole = speakerRole || 'ALL';
      const chunkConditions: Prisma.Sql[] = [];
      if (effectiveRole !== 'ALL') {
        chunkConditions.push(Prisma.sql`speaker_role = ${effectiveRole}`);
      }
      const chunkWhere = chunkConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(chunkConditions, ' AND ')}`
        : Prisma.empty;

      const overFetchMultiplier = validatorId ? 10 : 5;
      const fetchLimit = limit * overFetchMultiplier;

      const results = await db.$transaction(async (tx) => {
        await tx.$executeRaw`SET LOCAL hnsw.ef_search = 100`;

        const candidates = await tx.$queryRaw<{
          id: number; content: string; question: string | null; context_prefix: string | null;
          speaker_role: string; speaker_name: string | null; chunk_index: number;
          episode_id: number; distance: number;
        }[]>`
          SELECT id, content, question, context_prefix, speaker_role, speaker_name,
                 chunk_index, episode_id,
                 embedding <=> ${vectorStr}::vector(768) AS distance
          FROM podcast_chunks
          ${chunkWhere}
          ORDER BY embedding <=> ${vectorStr}::vector(768)
          LIMIT ${fetchLimit}
        `;

        if (candidates.length === 0) return [];

        const candidateIds = candidates.map(c => c.id);

        const postConditions: Prisma.Sql[] = [
          Prisma.sql`pc.id = ANY(${candidateIds})`,
        ];

        if (validatorId) {
          postConditions.push(Prisma.sql`pe.id IN (
            SELECT pe2.id FROM podcast_episodes pe2
            LEFT JOIN LATERAL (
              SELECT v2.id FROM validators v2
              WHERE (pe2.identity IS NOT NULL AND pe2.identity != '' AND v2.identity = pe2.identity)
                 OR (pe2.moniker IS NOT NULL AND LOWER(v2.moniker) = LOWER(pe2.moniker))
                 OR (pe2.primary_project IS NOT NULL AND LOWER(v2.moniker) = LOWER(pe2.primary_project))
              LIMIT 1
            ) v2 ON true
            WHERE v2.id = ${validatorId}
          )`);
        }

        const postWhere = Prisma.sql`WHERE ${Prisma.join(postConditions, ' AND ')}`;

        return tx.$queryRaw<PodcastChunkResult[]>`
          SELECT pc.id, pc.content, pc.question, pc.context_prefix AS "contextPrefix",
                 pc.speaker_role AS "speakerRole", pc.speaker_name AS "speakerName",
                 pc.chunk_index AS "chunkIndex",
                 1 - (pc.embedding <=> ${vectorStr}::vector(768)) AS similarity,
                 pe.title AS "episodeTitle", pe.episode_url AS "episodeUrl",
                 pe.slug AS "episodeSlug", pe.guest_name AS "guestName",
                 pe.primary_project AS "primaryProject",
                 pe.mentioned_entities AS "mentionedEntities",
                 v.id AS "validatorId",
                 v.moniker AS "validatorMoniker",
                 c.name AS "chainName", c.pretty_name AS "chainPrettyName", c.id AS "chainId"
          FROM podcast_chunks pc
          JOIN podcast_episodes pe ON pc.episode_id = pe.id
          LEFT JOIN chains c ON pe.chain_id = c.id
          LEFT JOIN LATERAL (
            SELECT v2.id, v2.moniker FROM validators v2
            WHERE (pe.identity IS NOT NULL AND pe.identity != '' AND v2.identity = pe.identity)
               OR (pe.moniker IS NOT NULL AND LOWER(v2.moniker) = LOWER(pe.moniker))
               OR (pe.primary_project IS NOT NULL AND LOWER(v2.moniker) = LOWER(pe.primary_project))
            ORDER BY
              CASE WHEN pe.identity IS NOT NULL AND pe.identity != '' AND v2.identity = pe.identity THEN 0
                   WHEN pe.moniker IS NOT NULL AND LOWER(v2.moniker) = LOWER(pe.moniker) THEN 1
                   ELSE 2 END
            LIMIT 1
          ) v ON true
          ${postWhere}
            AND 1 - (pc.embedding <=> ${vectorStr}::vector(768)) > 0.5
          ORDER BY pc.embedding <=> ${vectorStr}::vector(768)
          LIMIT ${limit}
        `;
      }, { timeout: 30000 });

      return results;
    } catch (error) {
      logError(`searchChunks failed: ${error instanceof Error ? error.message : String(error)}, context: embedding.length=${embedding.length}, validatorId=${validatorId}, speakerRole=${speakerRole}`);
      throw error;
    }
  },

  async getEpisodeSummariesBatch(
    validators: { identity: string; moniker: string }[],
  ): Promise<Map<string, EpisodeSummaryResult>> {
    const result = new Map<string, EpisodeSummaryResult>();
    if (validators.length === 0) return result;

    const HOST_IDENTITY = 'FA230088439F5B88';
    const HOST_MONIKER = 'Citizen Web3';
    const nonHostValidators: { identity: string; moniker: string }[] = [];

    for (const v of validators) {
      const isHost = v.identity === HOST_IDENTITY
        || (v.moniker && HOST_MONIKER.toLowerCase() === v.moniker.toLowerCase());
      if (isHost && v.identity) {
        const hostMeta = await db.podcastEpisode.findFirst({
          where: { slug: '__host_meta__', summary: { not: null } },
          select: { summary: true, episodeUrl: true, title: true },
        });
        if (hostMeta?.summary) {
          result.set(v.identity, { summary: hostMeta.summary, episodeUrl: hostMeta.episodeUrl, title: hostMeta.title });
        }
      } else {
        nonHostValidators.push(v);
      }
    }

    if (nonHostValidators.length === 0) return result;

    const identities = nonHostValidators.map(v => v.identity).filter(Boolean);
    const monikers = nonHostValidators.map(v => v.moniker).filter(Boolean);

    if (identities.length === 0 && monikers.length === 0) return result;

    const episodes = await db.podcastEpisode.findMany({
      where: {
        summary: { not: null },
        slug: { not: '__host_meta__' },
        OR: [
          ...(identities.length > 0 ? [{ identity: { in: identities } }] : []),
          ...(monikers.length > 0 ? [{ moniker: { in: monikers, mode: 'insensitive' as const } }] : []),
          ...(monikers.length > 0 ? [{ primaryProject: { in: monikers, mode: 'insensitive' as const } }] : []),
        ],
      },
      select: { identity: true, moniker: true, primaryProject: true, summary: true, episodeUrl: true, title: true },
    });

    for (const v of nonHostValidators) {
      if (!v.identity) continue;
      const byIdentity = episodes.find(e => e.identity === v.identity);
      if (byIdentity?.summary) {
        result.set(v.identity, { summary: byIdentity.summary, episodeUrl: byIdentity.episodeUrl, title: byIdentity.title });
        continue;
      }
      if (v.moniker) {
        const byMoniker = episodes.find(e => e.moniker?.toLowerCase() === v.moniker.toLowerCase());
        if (byMoniker?.summary) {
          result.set(v.identity, { summary: byMoniker.summary, episodeUrl: byMoniker.episodeUrl, title: byMoniker.title });
          continue;
        }
        const byProject = episodes.find(e => e.primaryProject?.toLowerCase() === v.moniker.toLowerCase());
        if (byProject?.summary) {
          result.set(v.identity, { summary: byProject.summary, episodeUrl: byProject.episodeUrl, title: byProject.title });
        }
      }
    }

    return result;
  },
};

export default podcastService;
