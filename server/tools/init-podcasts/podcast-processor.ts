import fs from 'fs';
import path from 'path';

import { embedMany, generateText, Output } from 'ai';
import { Prisma } from '@prisma/client';

import type { Chunk, EpisodeMeta, IndexEntry, Segment } from './shared';
import {
  CHUNK_INSERT_BATCH_SIZE,
  CHUNK_MAX_WORDS,
  CHUNK_MIN_WORDS,
  CHUNK_OVERLAP_WORDS,
  db,
  EMBEDDING_MODEL,
  HOST_ALIASES,
  logError,
  logWarn,
  metadataSchema,
  PODCAST_EMBEDDING_DIMENSIONS,
  PODCAST_EMBEDDING_MODEL_ID,
  RATE_LIMIT_DELAY_MS,
  splitWithOverlap,
  SUMMARY_MODEL,
  TRANSCRIPTS_DIR,
  wordCount,
} from './shared';

const identifySpeaker = (
  label: string,
  guestName: string,
  speakerLabel?: string | null,
): 'HOST' | 'GUEST' => {
  const lower = label.toLowerCase().trim();

  if (HOST_ALIASES.some(h => lower === h || lower.startsWith(h + ' '))) return 'HOST';

  if (speakerLabel && lower === speakerLabel.toLowerCase().trim()) return 'GUEST';

  const guestLower = guestName.toLowerCase().trim();
  const guestFirst = guestLower.split(' ')[0];
  if (lower === guestLower || lower === guestFirst || lower.startsWith(guestFirst + ' ')) {
    return 'GUEST';
  }

  return 'GUEST';
};

const parseTranscript = (
  text: string,
  guestName: string,
  speakerLabel?: string | null,
): Segment[] => {
  const lines = text.split('\n');

  const normalizedLines: string[] = [];
  for (const line of lines) {
    const bracketMatch = line.match(/^\s*\[([^\]]+)\]\s*:\s*(.*)/);
    if (bracketMatch) {
      normalizedLines.push(''); // blank line before label
      normalizedLines.push(bracketMatch[1].trim());
      if (bracketMatch[2].trim()) {
        normalizedLines.push(bracketMatch[2].trim());
      }
    } else {
      normalizedLines.push(line);
    }
  }

  const labelCounts = new Map<string, number>();
  for (let i = 1; i < normalizedLines.length; i++) {
    const prevTrimmed = normalizedLines[i - 1].trim();
    const currTrimmed = normalizedLines[i].trim();
    if (prevTrimmed === '' && currTrimmed !== '') {
      const label = currTrimmed.replace(/[:\s]+$/, '');
      // Label pattern: starts with letter, only alphanumeric/space/underscore/hyphen, <80 chars
      if (label.length > 0 && label.length < 80 && /^[A-Za-z]/.test(label)) {
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      }
    }
  }

  const confirmedLabels = new Set<string>();
  for (const [label, count] of Array.from(labelCounts.entries())) {
    const lower = label.toLowerCase().trim();
    const isKnown = HOST_ALIASES.some(h => lower === h || lower.startsWith(h + ' '))
      || (speakerLabel && lower === speakerLabel.toLowerCase().trim())
      || lower === guestName.toLowerCase().trim()
      || lower === guestName.toLowerCase().trim().split(' ')[0];
    if (count >= 2 || isKnown) {
      confirmedLabels.add(label);
    }
  }

  const segments: Segment[] = [];
  let currentRole: 'HOST' | 'GUEST' | null = null;
  let currentSpeakerName: string | null = null;
  let currentContent: string[] = [];
  let prevLineBlank = true;

  for (const line of normalizedLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      prevLineBlank = true;
      continue;
    }

    const label = trimmed.replace(/[:\s]+$/, '');

    if (prevLineBlank && confirmedLabels.has(label)) {
      if (currentRole && currentContent.length > 0) {
        const segText = currentContent.join(' ').trim();
        if (segText) {
          segments.push({
            role: currentRole,
            speakerName: currentSpeakerName,
            text: segText,
            wordCount: wordCount(segText),
          });
        }
      }
      const role = identifySpeaker(label, guestName, speakerLabel);
      currentRole = role;
      currentSpeakerName = role === 'HOST' ? null : guestName;
      currentContent = [];
    } else if (currentRole) {
      currentContent.push(trimmed);
    }

    prevLineBlank = false;
  }

  // Save last segment
  if (currentRole && currentContent.length > 0) {
    const segText = currentContent.join(' ').trim();
    if (segText) {
      segments.push({
        role: currentRole,
        speakerName: currentSpeakerName,
        text: segText,
        wordCount: wordCount(segText),
      });
    }
  }

  return segments;
};

const chunkSegments = (segments: Segment[]): Chunk[] => {
  const chunks: Chunk[] = [];
  let chunkIndex = 0;
  let lastHostRemark: string | null = null;

  for (const seg of segments) {
    if (seg.role === 'HOST') {
      lastHostRemark = seg.text;
    }
    const questionForThisChunk = seg.role === 'GUEST' ? lastHostRemark : null;

    if (seg.wordCount > CHUNK_MAX_WORDS) {
      const subTexts = splitWithOverlap(seg.text, CHUNK_MAX_WORDS, CHUNK_OVERLAP_WORDS);
      for (let i = 0; i < subTexts.length; i++) {
        chunks.push({
          content: subTexts[i],
          question: i === 0 ? questionForThisChunk : null,
          speakerRole: seg.role,
          speakerName: seg.speakerName,
          chunkIndex: chunkIndex++,
        });
      }
    } else if (seg.wordCount < CHUNK_MIN_WORDS && chunks.length > 0
      && chunks[chunks.length - 1].speakerRole === seg.role
      && wordCount(chunks[chunks.length - 1].content) + seg.wordCount <= CHUNK_MAX_WORDS) {
      chunks[chunks.length - 1].content += '\n\n' + seg.text;
    } else {
      chunks.push({
        content: seg.text,
        question: questionForThisChunk,
        speakerRole: seg.role,
        speakerName: seg.speakerName,
        chunkIndex: chunkIndex++,
      });
    }
  }

  return chunks;
};

const generateContextPrefixes = (
  entry: IndexEntry,
  chunks: Chunk[],
): string[] => {
  const episodeCtx = `episode "${entry.title}" with ${entry.guestName}${
    entry.chainName ? ` about ${entry.chainName}` : ''
  }`;

  return chunks.map(chunk => {
    const speaker = chunk.speakerRole === 'HOST'
      ? 'the host Citizen Web3'
      : `guest ${chunk.speakerName || entry.guestName}`;
    return `In the podcast ${episodeCtx}, ${speaker} said:`;
  });
};

const buildEmbeddingInput = (chunk: Chunk, prefix: string): string => {
  const base = chunk.speakerRole === 'GUEST' && chunk.question
    ? `Q: ${chunk.question}\nA: ${chunk.content}`
    : chunk.content;
  return `${prefix}\n\n${base}`;
};


const generateSummary = async (
  transcript: string,
  guestName: string,
): Promise<string | null> => {
  try {
    const { text } = await generateText({
      model: SUMMARY_MODEL,
      maxOutputTokens: 8192,
      prompt: `Write a 500-1000 word English summary of this Citizen Web3 podcast interview with guest ${guestName}. Focus on the guest's key opinions, positions, insights and values. Include notable direct quotes. Plain prose, no headers or bullet points. Only include information directly stated in the transcript.\n\nTranscript:\n${transcript}`,
    });
    return text?.trim() || null;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT'))) {
      throw error;
    }
    logError(`Summary generation failed for "${guestName}": ${error}`);
    return null;
  }
};

const extractMetadata = async (
  summary: string,
  guestName: string,
): Promise<{ primaryProject: string | null; mentionedEntities: string[] }> => {
  try {
    const { output } = await generateText({
      model: SUMMARY_MODEL,
      maxOutputTokens: 4096,
      output: Output.object({ schema: metadataSchema }),
      prompt: `Extract metadata from this podcast episode summary. The guest is ${guestName}.\n\nSummary:\n${summary}`,
    });
    if (output) {
      return {
        primaryProject: output.primaryProject ?? null,
        mentionedEntities: output.mentionedEntities ?? [],
      };
    }
  } catch (error) {
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT'))) {
      throw error;
    }
    logWarn(`Metadata extraction failed for "${guestName}": ${error}`);
  }
  return { primaryProject: null, mentionedEntities: [] };
};

const generateSummaryAndMeta = async (
  transcript: string,
  guestName: string,
): Promise<EpisodeMeta | null> => {
  const summary = await generateSummary(transcript, guestName);
  if (!summary) return null;

  await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
  const { primaryProject, mentionedEntities } = await extractMetadata(summary, guestName);

  return { summary, primaryProject, mentionedEntities };
};

const processEpisode = async (entry: IndexEntry): Promise<boolean> => {
  if (!entry.guestName?.trim()) {
    logWarn(`Empty guestName for "${entry.slug}", skipping`);
    return false;
  }

  const transcriptPath = path.join(TRANSCRIPTS_DIR, `${entry.slug}.txt`);
  if (!fs.existsSync(transcriptPath)) {
    logWarn(`No transcript for "${entry.slug}", skipping`);
    return false;
  }
  const transcript = fs.readFileSync(transcriptPath, 'utf-8');

  if (!transcript.trim()) {
    logWarn(`Empty transcript file for "${entry.slug}", skipping`);
    return false;
  }

  const chainId = entry.chainName
    ? (await db.chain.findFirst({ where: { name: { equals: entry.chainName, mode: 'insensitive' } } }))?.id ?? null
    : null;

  const segments = parseTranscript(transcript, entry.guestName, entry.speakerLabel);

  const chunks = chunkSegments(segments);

  if (chunks.length === 0) {
    logWarn(`No chunks parsed for "${entry.slug}", skipping`);
    return false;
  }

  const prefixes = generateContextPrefixes(entry, chunks);

  const embeddingInputs = chunks.map((chunk, i) => buildEmbeddingInput(chunk, prefixes[i]));

  const meta = await generateSummaryAndMeta(transcript, entry.guestName);
  const summary = meta?.summary ?? null;
  const primaryProject = meta?.primaryProject ?? null;
  const mentionedEntities = meta?.mentionedEntities ?? [];

  await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));

  const EMBED_BATCH_SIZE = 100;
  const embeddings: number[][] = [];
  for (let i = 0; i < embeddingInputs.length; i += EMBED_BATCH_SIZE) {
    const batch = embeddingInputs.slice(i, i + EMBED_BATCH_SIZE);
    const { embeddings: batchEmbeddings } = await embedMany({
      model: EMBEDDING_MODEL,
      values: batch,
      providerOptions: {
        google: {
          taskType: 'RETRIEVAL_DOCUMENT',
          outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
        },
      },
    });
    embeddings.push(...batchEmbeddings);
    if (i + EMBED_BATCH_SIZE < embeddingInputs.length) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
    }
  }

  if (embeddings.length !== embeddingInputs.length) {
    throw new Error(`Embedding count mismatch for "${entry.slug}": expected ${embeddingInputs.length}, got ${embeddings.length}`);
  }

  if (embeddings.length > 0 && embeddings[0].length !== PODCAST_EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${PODCAST_EMBEDDING_DIMENSIONS} embedding dims, got ${embeddings[0].length}`);
  }

  await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));

  const existingEpisode = await db.podcastEpisode.findUnique({ where: { slug: entry.slug } });

  if (existingEpisode) {
    await db.podcastEpisode.update({
      where: { slug: entry.slug },
      data: { summary, primaryProject, mentionedEntities },
    });
    const chunkCount = await db.podcastChunk.count({ where: { episodeId: existingEpisode.id } });
    if (chunkCount > 0) {
      return true;
    }
    if (chunks.length > 0) {
      await db.$transaction(async (tx) => {
        for (let batchStart = 0; batchStart < chunks.length; batchStart += CHUNK_INSERT_BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + CHUNK_INSERT_BATCH_SIZE, chunks.length);
          const values = [];
          for (let i = batchStart; i < batchEnd; i++) {
            const chunk = chunks[i];
            if (!embeddings[i].every(v => Number.isFinite(v))) {
              throw new Error(`Invalid embedding values for chunk ${i} of "${entry.slug}"`);
            }
            const vectorStr = `[${embeddings[i].join(',')}]`;
            values.push(Prisma.sql`(
              ${existingEpisode.id}, ${chunk.speakerRole}, ${chunk.speakerName},
              ${chunk.question}, ${chunk.content}, ${prefixes[i]},
              ${chunk.chunkIndex}, ${vectorStr}::vector, ${PODCAST_EMBEDDING_MODEL_ID},
              NOW(), NOW()
            )`);
          }

          await tx.$executeRaw`
              INSERT INTO podcast_chunks (episode_id, speaker_role, speaker_name, question, content,
                                          context_prefix, chunk_index, embedding, embedding_model,
                                          created_at, updated_at)
              VALUES ${Prisma.join(values)}
          `;
        }
      }, { timeout: 60000 });
    }
  } else {
    await db.$transaction(async (tx) => {
      const episode = await tx.podcastEpisode.create({
        data: {
          slug: entry.slug,
          title: entry.title,
          description: entry.description || null,
          publicationDate: entry.publicationDate || null,
          duration: entry.duration || null,
          episodeUrl: entry.episodeUrl,
          playerUrl: entry.playerUrl || null,
          guestName: entry.guestName,
          speakerLabel: entry.speakerLabel || null,
          summary,
          chainName: entry.chainName || null,
          identity: entry.identity || null,
          moniker: entry.moniker || null,
          primaryProject,
          mentionedEntities,
          chainId,
        },
      });

      if (chunks.length > 0) {
        for (let batchStart = 0; batchStart < chunks.length; batchStart += CHUNK_INSERT_BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + CHUNK_INSERT_BATCH_SIZE, chunks.length);
          const values = [];
          for (let i = batchStart; i < batchEnd; i++) {
            const chunk = chunks[i];
            if (!embeddings[i].every(v => Number.isFinite(v))) {
              throw new Error(`Invalid embedding values for chunk ${i} of "${entry.slug}"`);
            }
            const vectorStr = `[${embeddings[i].join(',')}]`;
            values.push(Prisma.sql`(
              ${episode.id}, ${chunk.speakerRole}, ${chunk.speakerName},
              ${chunk.question}, ${chunk.content}, ${prefixes[i]},
              ${chunk.chunkIndex}, ${vectorStr}::vector, ${PODCAST_EMBEDDING_MODEL_ID},
              NOW(), NOW()
            )`);
          }

          await tx.$executeRaw`
              INSERT INTO podcast_chunks (episode_id, speaker_role, speaker_name, question, content,
                                          context_prefix, chunk_index, embedding, embedding_model,
                                          created_at, updated_at)
              VALUES ${Prisma.join(values)}
          `;
        }
      }
    }, { timeout: 60000 });
  }

  return true;
};

export { processEpisode, identifySpeaker, parseTranscript, chunkSegments };
