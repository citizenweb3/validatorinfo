import fs from 'fs';

import type { IndexEntry } from './init-podcasts/shared';
import { db, INDEX_PATH, logError, logInfo, logWarn, RATE_LIMIT_DELAY_MS } from './init-podcasts/shared';
import { processEpisode } from './init-podcasts/podcast-processor';
import { CW3_DOC_SOURCES, processCW3Document } from './init-podcasts/cw3-doc-processor';
import { generateHostMeta } from './init-podcasts/host-meta-generator';

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
          logError('Systemic DB error, skipping episode');
          break;
        }
        break;
      }
    }
  }

  logInfo('Processing CW3 documentation...');
  let docsProcessed = 0;
  for (const source of CW3_DOC_SOURCES) {
    try {
      const success = await processCW3Document(source);
      if (success) docsProcessed++;
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
    } catch (error) {
      logError(`Failed CW3 doc "${source.slug}": ${error}`);
    }
  }
  logInfo(`CW3 docs: ${docsProcessed}/${CW3_DOC_SOURCES.length} processed`);

  await generateHostMeta(processed);

  logInfo(`Done: ${processed} processed, ${skipped} skipped`);
};

main()
  .catch((e) => {
    logError('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
