import fs from 'fs';
import path from 'path';

import { embedMany, generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import db from '@/db';
import logger from '@/logger';
import { PODCAST_EMBEDDING_DIMENSIONS, PODCAST_EMBEDDING_MODEL_ID } from '@/server/config/podcast-config';

const { logInfo, logError, logWarn } = logger('init-podcasts');

interface IndexEntry {
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

interface Segment {
  role: 'HOST' | 'GUEST';
  speakerName: string | null;
  text: string;
  wordCount: number;
}

interface Chunk {
  content: string;
  question: string | null;
  speakerRole: 'HOST' | 'GUEST';
  speakerName: string | null;
  chunkIndex: number;
}

const EMBEDDING_MODEL = google.textEmbeddingModel(PODCAST_EMBEDDING_MODEL_ID);
const SUMMARY_MODEL = google('gemini-2.5-flash');
const CHUNK_INSERT_BATCH_SIZE = 50;
const CHUNK_MAX_WORDS = 500;
const CHUNK_MIN_WORDS = 300;
const CHUNK_OVERLAP_WORDS = 100;
const HOST_ALIASES = ['citizen web3', 'citizenweb3', 'citizen cosmos', 'serj', 'anna'];
const RATE_LIMIT_DELAY_MS = 2000;

const DATA_DIR = path.join(__dirname, '../data/podcasts');
const INDEX_PATH = path.join(DATA_DIR, 'index.json');
const TRANSCRIPTS_DIR = path.join(DATA_DIR, 'transcripts');

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

const wordCount = (text: string): number => text.split(/\s+/).filter(Boolean).length;

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

const splitWithOverlap = (text: string, maxWords: number, overlapWords: number): string[] => {
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

interface EpisodeMeta {
  summary: string;
  primaryProject: string | null;
  mentionedEntities: string[];
}

const metadataSchema = z.object({
  primaryProject: z.string().nullable().describe('The main company/project/validator/protocol the guest represents. Use the ORGANIZATION name, not the person name. Examples: "Chorus One", "Celestia", "Sentinel". null if unclear.'),
  mentionedEntities: z.array(z.string()).describe('Other notable proper nouns mentioned: projects, networks, protocols, tools, people. Exclude the guest name and their primaryProject. Exclude generic concepts like "privacy" or "decentralization".'),
});

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

const HOST_IDENTITY = 'FA230088439F5B88';
const HOST_MONIKER = 'Citizen Web3';

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

const main = async () => {
  logInfo('Starting podcast initialization (v2)...');

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    logError('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    process.exit(1);
  }

  await db.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
  logInfo('pgvector extension enabled');

  const raw: IndexEntry[] = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  const seen = new Set<string>();
  const entries = raw.filter(e => {
    if (seen.has(e.slug)) {
      logWarn(`Duplicate slug "${e.slug}"`);
      return false;
    }
    seen.add(e.slug);
    return true;
  });
  logInfo(`Loaded ${entries.length} episodes from index.json`);

  // Step 3: Filter to new episodes only
  const existing = await db.$queryRaw<{ slug: string }[]>`SELECT slug
                                                          FROM podcast_episodes
                                                          WHERE summary IS NOT NULL`;
  const existingSlugs = new Set(existing.map(e => e.slug));
  const newEntries = entries.filter(e => !existingSlugs.has(e.slug));
  if (newEntries.length === 0) {
    logInfo('All episodes already in DB, checking host meta-summary...');
  } else {
    logInfo(`${existingSlugs.size} episodes already in DB, ${newEntries.length} new to process`);
  }

  let processed = 0, skipped = 0;

  const MAX_RETRIES = 3;
  const BACKOFF_BASE_MS = 5000;

  for (const entry of newEntries) {
    let retries = 0;
    while (retries <= MAX_RETRIES) {
      try {
        const success = await processEpisode(entry);
        if (success) {
          processed++;
          logInfo(`[${processed}/${newEntries.length}] Processed "${entry.slug}"`);
        } else {
          skipped++;
        }
        break;
      } catch (error) {
        if (error instanceof Error && error.message.includes('429') && retries < MAX_RETRIES) {
          retries++;
          const delay = BACKOFF_BASE_MS * retries;
          logWarn(`Rate limited on "${entry.slug}", retry ${retries}/${MAX_RETRIES} after ${delay / 1000}s`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        logError(`Failed "${entry.slug}": ${error}`);
        skipped++;
        if (error instanceof Error && (
          error.message.includes('P2024') ||
          error.message.includes('Can\'t reach database') ||
          error.message.includes('ECONNREFUSED')
        )) {
          logError('Systemic DB error, stopping');
          break;
        }
        break;
      }
    }
  }

  const hostMetaSlug = '__host_meta__';
  const existingMeta = await db.podcastEpisode.findUnique({ where: { slug: hostMetaSlug } });

  if (!existingMeta || processed > 0) {
    if (existingMeta) {
      await db.podcastEpisode.delete({ where: { slug: hostMetaSlug } });
    }
    const hostChunks = await db.$queryRaw<{ content: string }[]>`
        SELECT pc.content
        FROM podcast_chunks pc
        WHERE pc.speaker_role = 'HOST'
          AND array_length(string_to_array(trim(pc.content), ' '), 1) > 50
        ORDER BY pc.id LIMIT 500
    `;

    if (hostChunks.length > 0) {
      const hostTexts = hostChunks.map(c => c.content).join('\n\n');

      const HOST_TOPICS = [
        {
          name: 'Technologies',
          prompt: 'What are the host\'s views on blockchain technologies? Cover: tech stack preferences, protocols he advocates for (Tendermint, CometBFT, CosmWasm, etc.), development tools, programming languages, technical trade-offs (performance vs decentralization), privacy technologies (Monero, zero-knowledge proofs, mixnets), Layer 1 vs Layer 2, modular vs monolithic architecture, open source philosophy, specific technical innovations he discusses.',
        },
        {
          name: 'Validating',
          prompt: 'What are the host\'s views on validation and staking? Cover: his own experience running validators, what makes a good validator, validator economics and sustainability, infrastructure challenges, hardware and DevOps, skin in the game philosophy, validator independence, centralization risks in staking (liquid staking, institutional validators), slashing and security, validator community and collaboration, decentralization of validator sets.',
        },
        {
          name: 'Consensus',
          prompt: 'What are the host\'s views on consensus and governance? Cover: consensus mechanisms (BFT, PoS, PoW, DPoS), on-chain governance vs off-chain, DAO structures, voting participation and apathy, community decision-making, proposal processes, treasury and funding governance, censorship resistance, decentralization of power, token-weighted voting problems, quadratic voting, conviction voting, specific governance debates he references.',
        },
        {
          name: 'Blockchain networks',
          prompt: 'What are the host\'s views on specific blockchain networks and ecosystems? Cover: Cosmos ecosystem (Hub, IBC, app-chains, sovereignty), Ethereum and its ecosystem, Bitcoin, Polkadot, Solana, privacy chains (Monero, Secret Network, Zcash), specific L1s and L2s he discusses, interoperability and cross-chain communication, multi-chain future vs winner-take-all, network effects, ecosystem culture differences, specific projects and protocols he champions or criticizes (name each one).',
        },
        {
          name: 'AI',
          prompt: 'What are the host\'s views on artificial intelligence? Cover: AI technologies and tools, philosophy around AI development, AI integration with blockchain and Web3, AI agents and autonomous systems, decentralized AI vs centralized AI, risks and opportunities of AI, AI governance and ethics, specific AI projects or concepts he discusses, impact of AI on the crypto ecosystem and validators, AI and privacy concerns.',
        },
        {
          name: 'Privacy',
          prompt: 'What are the host\'s views on privacy? Cover: privacy as a fundamental right, privacy coins and chains (Monero, Zcash, Secret Network), zero-knowledge proofs, mixnets, encryption, surveillance and censorship resistance, privacy vs transparency trade-offs, KYC/AML debates, data sovereignty, self-custody, private transactions, privacy-preserving technologies, specific privacy projects he champions or criticizes, privacy in DeFi, privacy and regulation, why privacy matters for validators and users.',
        },
        {
          name: 'Decentralization',
          prompt: 'What are the host\'s views on decentralization? Cover: what true decentralization means, centralization risks in crypto (exchanges, staking providers, infrastructure), decentralization of validator sets, geographic distribution, client diversity, self-sovereignty, censorship resistance, decentralization vs efficiency trade-offs, decentralized governance, decentralized identity, decentralization of development teams, specific examples of centralization he criticizes, projects he praises for decentralization, community ownership, permissionless systems, trustlessness.',
        },
      ];

      const MIN_TOPIC_WORDS = 300;
      const MAX_RETRIES = 3;

      const topicSummaries: string[] = [];
      for (const topic of HOST_TOPICS) {
        let bestText = '';
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const { text } = await generateText({
            model: SUMMARY_MODEL,
            maxOutputTokens: 4096,
            system: 'You are a podcast content analyst writing an exhaustive profile. Rules: (1) Only include information directly stated in the provided text. (2) Always output in English. (3) Be extremely thorough — cover every subtopic mentioned. (4) Include specific names of projects, people, networks, and tools. (5) Include direct quotes where possible. (6) Your output MUST be at least 400 words. Shorter outputs are unacceptable.',
            prompt: `Below are remarks by the host of the Citizen Web3 podcast (Serj / Citizen Web3) across ~150 episodes of interviews with blockchain validators and projects.

TOPIC: ${topic.name}

INSTRUCTIONS: ${topic.prompt}

REQUIREMENTS:
- Write MINIMUM 400 words, target 500-700 words
- Cover every subtopic listed above that has evidence in the text
- Include direct quotes with attribution
- Name specific projects, people, networks, and tools
- Plain prose paragraphs only — no headers, no bullet points, no markdown, no numbering

Host remarks:
${hostTexts}`,
          });
          const words = wordCount(text?.trim() || '');
          if (text?.trim() && words >= MIN_TOPIC_WORDS) {
            bestText = text.trim();
            logInfo(`Host meta topic "${topic.name}": ${words} words (attempt ${attempt})`);
            break;
          }
          if (text?.trim() && words > wordCount(bestText)) {
            bestText = text.trim();
          }
          if (attempt < MAX_RETRIES) {
            logWarn(`Host meta topic "${topic.name}": only ${words} words (attempt ${attempt}/${MAX_RETRIES}), retrying...`);
            await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
          } else {
            logWarn(`Host meta topic "${topic.name}": ${words} words after ${MAX_RETRIES} attempts, using best result`);
          }
        }
        if (bestText) {
          topicSummaries.push(bestText);
        }
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
      }

      const hostSummary = topicSummaries.join('\n\n');

      if (hostSummary.trim()) {
        const HOST_CHUNK_SIZE = 150;
        const hostChunksWithTopics: { text: string; topicName: string }[] = [];

        for (let t = 0; t < topicSummaries.length; t++) {
          const words = topicSummaries[t].split(/\s+/);
          for (let i = 0; i < words.length; i += HOST_CHUNK_SIZE) {
            hostChunksWithTopics.push({
              text: words.slice(i, i + HOST_CHUNK_SIZE).join(' '),
              topicName: HOST_TOPICS[t].name,
            });
          }
        }

        const hostEmbeddingInputs = hostChunksWithTopics.map(
          (chunk) => `Citizen Web3 podcast host on ${chunk.topicName}:\n${chunk.text}`,
        );
        const { embeddings: hostEmbeddings } = await embedMany({
          model: EMBEDDING_MODEL,
          values: hostEmbeddingInputs,
          providerOptions: {
            google: {
              taskType: 'RETRIEVAL_DOCUMENT',
              outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
            },
          },
        });

        await db.$transaction(async (tx) => {
          const episode = await tx.podcastEpisode.create({
            data: {
              slug: hostMetaSlug,
              title: 'Citizen Web3 — Host Values & Philosophy',
              episodeUrl: 'https://podcast.citizenweb3.com',
              guestName: 'Citizen Web3',
              summary: hostSummary,
              identity: HOST_IDENTITY,
              moniker: HOST_MONIKER,
            },
          });

          const values: Prisma.Sql[] = [];
          for (let i = 0; i < hostChunksWithTopics.length; i++) {
            const vectorStr = `[${hostEmbeddings[i].join(',')}]`;
            values.push(Prisma.sql`(
              ${episode.id}, ${'HOST'}, ${'Citizen Web3'},
              ${null}, ${hostChunksWithTopics[i].text},
              ${'Citizen Web3 podcast host — aggregated values and philosophy'},
              ${i}, ${vectorStr}::vector, ${PODCAST_EMBEDDING_MODEL_ID},
              NOW(), NOW()
            )`);
          }

          if (values.length > 0) {
            await tx.$executeRaw`
                INSERT INTO podcast_chunks (episode_id, speaker_role, speaker_name, question, content,
                                            context_prefix, chunk_index, embedding, embedding_model,
                                            created_at, updated_at)
                VALUES ${Prisma.join(values)}
            `;
          }
        }, { timeout: 30000 });

        logInfo(`Generated host meta-summary: ${wordCount(hostSummary)} words, ${hostChunksWithTopics.length} chunks`);
      }
    }
  }

  logInfo(`Done: ${processed} processed, ${skipped} skipped`);
};

main()
  .catch((e) => {
    logError('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
