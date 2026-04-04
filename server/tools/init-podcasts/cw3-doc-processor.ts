import fs from 'fs';
import path from 'path';

import { embedMany } from 'ai';
import { Prisma } from '@prisma/client';

import type { CW3DocSource, DocChunk } from './shared';
import {
  CHUNK_INSERT_BATCH_SIZE,
  CW3_DOCS_DIR,
  db,
  DOC_CHUNK_MAX_WORDS,
  DOC_CHUNK_MIN_WORDS,
  DOC_CHUNK_OVERLAP_WORDS,
  EMBEDDING_MODEL,
  FETCH_TIMEOUT_MS,
  HOST_IDENTITY,
  HOST_MONIKER,
  logError,
  logInfo,
  logWarn,
  PODCAST_EMBEDDING_DIMENSIONS,
  PODCAST_EMBEDDING_MODEL_ID,
  RATE_LIMIT_DELAY_MS,
  splitWithOverlap,
  wordCount,
} from './shared';

const fetchGitHubReadme = async (owner: string, repo: string): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          ...(process.env.GITHUB_API_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}` }
            : {}),
        },
        signal: controller.signal,
      },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchGitHubProfile = async (username: string): Promise<string> => {
  const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  };

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_API_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}` }
      : {}),
  };

  const profileRes = await fetchWithTimeout(
    `https://api.github.com/users/${username}`,
    { headers },
  );
  if (!profileRes.ok) throw new Error(`GitHub API ${profileRes.status}`);
  const profile = await profileRes.json();

  const reposRes = await fetchWithTimeout(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
    { headers },
  );
  if (!reposRes.ok) throw new Error(`GitHub repos API ${reposRes.status}`);
  const repos = await reposRes.json();

  const lines: string[] = [
    `# ${profile.name || username}`,
    '',
    profile.bio ? profile.bio : '',
    '',
    profile.company ? `**Organization:** ${profile.company}` : '',
    profile.blog ? `**Website:** ${profile.blog}` : '',
    profile.location ? `**Location:** ${profile.location}` : '',
    `**Public repos:** ${profile.public_repos}`,
    '',
    '## Notable Projects',
    '',
  ];

  for (const repo of repos) {
    if (repo.fork) continue;
    lines.push(
      `- **${repo.name}**: ${repo.description || 'No description'} (${repo.stargazers_count} stars)`,
    );
  }

  return lines.filter(line => line !== null && line !== undefined).join('\n');
};

const fetchWebPage = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return stripHtmlToText(html);
  } finally {
    clearTimeout(timeout);
  }
};

const stripHtmlToText = (html: string): string => {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const fetchOrFallback = async (
  fetchFn: () => Promise<string>,
  fallbackPath: string,
): Promise<string> => {
  try {
    const content = await fetchFn();
    if (content?.trim()) {
      fs.writeFileSync(fallbackPath, content, 'utf-8');
      return content;
    }
  } catch (error) {
    logWarn(`Fetch failed for ${fallbackPath}: ${error instanceof Error ? error.message : error}`);
  }
  if (fs.existsSync(fallbackPath)) {
    return fs.readFileSync(fallbackPath, 'utf-8');
  }
  logError(`No fallback file found: ${fallbackPath}`);
  return '';
};

export const CW3_DOC_SOURCES: CW3DocSource[] = [
  {
    slug: '__cw3_infrastructure__',
    title: 'Citizen Web3 — Validator Infrastructure',
    episodeUrl: 'https://github.com/citizenweb3/staking',
    fetchFn: () => fetchGitHubReadme('citizenweb3', 'staking'),
    fallbackFile: 'infrastructure.md',
  },
  {
    slug: '__cw3_manifesto__',
    title: 'Citizen Web3 — Manifesto & Philosophy',
    episodeUrl: 'https://www.citizenweb3.com',
    fetchFn: () => fetchWebPage('https://www.citizenweb3.com'),
    fallbackFile: 'manifesto.md',
  },
  {
    slug: '__cw3_validator__',
    title: 'Citizen Web3 — Validator Services & Networks',
    episodeUrl: 'https://www.citizenweb3.com/validator',
    fetchFn: () => fetchWebPage('https://www.citizenweb3.com/validator'),
    fallbackFile: 'validator.md',
  },
  {
    slug: '__cw3_cdi__',
    title: 'Citizen Web3 — Chain Data Indexer',
    episodeUrl: 'https://github.com/citizenweb3/chain-data-indexer',
    fetchFn: () => fetchGitHubReadme('citizenweb3', 'chain-data-indexer'),
    fallbackFile: 'cdi.md',
  },
  {
    slug: '__cw3_community__',
    title: 'Citizen Web3 — Web3 Society Community',
    episodeUrl: 'https://github.com/citizenweb3/web3-society',
    fetchFn: () => fetchGitHubReadme('citizenweb3', 'web3-society'),
    fallbackFile: 'community.md',
  },
  {
    slug: '__cw3_bvc__',
    title: 'Citizen Web3 — Baremetal Validator Coven',
    episodeUrl: 'https://bvc.citizenweb3.com',
    fetchFn: () => fetchWebPage('https://bvc.citizenweb3.com/getting-started/startpoint'),
    fallbackFile: 'bvc.md',
  },
  {
    slug: '__cw3_serj_site__',
    title: 'Serj from Citizen Web3 — Personal Site',
    episodeUrl: 'https://serejandmyself.github.io/',
    fetchFn: () => fetchWebPage('https://serejandmyself.github.io/'),
    fallbackFile: 'serj-site.md',
  },
  {
    slug: '__cw3_serj_github__',
    title: 'Serj from Citizen Web3 — GitHub Projects',
    episodeUrl: 'https://github.com/serejandmyself',
    fetchFn: () => fetchGitHubProfile('serejandmyself'),
    fallbackFile: 'serj-github.md',
  },
];

const chunkMarkdown = (text: string, docTitle: string): DocChunk[] => {
  const cleaned = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/---+/g, '')
    .trim();

  const sections: { heading: string; body: string }[] = [];
  const parts = cleaned.split(/^(#{1,3}\s+.+)$/m);

  let currentHeading = docTitle;
  let currentBody = '';

  for (const part of parts) {
    const headingMatch = part.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      if (currentBody.trim()) {
        sections.push({ heading: currentHeading, body: currentBody.trim() });
      }
      currentHeading = headingMatch[1].replace(/[*_`#]/g, '').trim();
      currentBody = '';
    } else {
      currentBody += ' ' + part;
    }
  }
  if (currentBody.trim()) {
    sections.push({ heading: currentHeading, body: currentBody.trim() });
  }

  const proseSections = sections.filter(s => {
    const withoutLinks = s.body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();
    return wordCount(withoutLinks) >= 30;
  });

  const chunks: DocChunk[] = [];
  let chunkIndex = 0;
  let mergeBuffer: { heading: string; body: string } | null = null;

  for (const section of proseSections) {
    const wc = wordCount(section.body);

    if (wc < DOC_CHUNK_MIN_WORDS) {
      if (mergeBuffer) {
        mergeBuffer.body += '\n\n' + section.body;
        mergeBuffer.heading += ' / ' + section.heading;
      } else {
        mergeBuffer = { ...section };
      }
      if (wordCount(mergeBuffer.body) >= DOC_CHUNK_MIN_WORDS) {
        chunks.push({ content: mergeBuffer.body, heading: mergeBuffer.heading, chunkIndex: chunkIndex++ });
        mergeBuffer = null;
      }
      continue;
    }

    if (mergeBuffer) {
      chunks.push({ content: mergeBuffer.body, heading: mergeBuffer.heading, chunkIndex: chunkIndex++ });
      mergeBuffer = null;
    }

    if (wc > DOC_CHUNK_MAX_WORDS) {
      const subTexts = splitWithOverlap(section.body, DOC_CHUNK_MAX_WORDS, DOC_CHUNK_OVERLAP_WORDS);
      for (const sub of subTexts) {
        chunks.push({ content: sub, heading: section.heading, chunkIndex: chunkIndex++ });
      }
    } else {
      chunks.push({ content: section.body, heading: section.heading, chunkIndex: chunkIndex++ });
    }
  }

  if (mergeBuffer) {
    chunks.push({ content: mergeBuffer.body, heading: mergeBuffer.heading, chunkIndex: chunkIndex++ });
  }

  return chunks;
};

export const processCW3Document = async (source: CW3DocSource): Promise<boolean> => {
  const fallbackPath = path.join(CW3_DOCS_DIR, source.fallbackFile);
  const content = await fetchOrFallback(source.fetchFn, fallbackPath);

  if (!content.trim()) {
    logWarn(`Empty content for "${source.slug}", skipping`);
    return false;
  }

  const chunks = chunkMarkdown(content, source.title);
  if (chunks.length === 0) {
    logWarn(`No chunks for "${source.slug}", skipping`);
    return false;
  }

  const prefixes = chunks.map(c =>
    `From Citizen Web3 document "${source.title}", section "${c.heading}":`,
  );

  const embeddingInputs = chunks.map((c, i) => `${prefixes[i]}\n\n${c.content}`);

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
    throw new Error(`Embedding count mismatch for "${source.slug}": expected ${embeddingInputs.length}, got ${embeddings.length}`);
  }

  await db.$transaction(async (tx) => {
    await tx.podcastEpisode.deleteMany({ where: { slug: source.slug } });

    const episode = await tx.podcastEpisode.create({
      data: {
        slug: source.slug,
        title: source.title,
        episodeUrl: source.episodeUrl,
        guestName: 'Citizen Web3',
        identity: HOST_IDENTITY,
        moniker: HOST_MONIKER,
        primaryProject: 'Citizen Web3',
        mentionedEntities: [],
      },
    });

    for (let batchStart = 0; batchStart < chunks.length; batchStart += CHUNK_INSERT_BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + CHUNK_INSERT_BATCH_SIZE, chunks.length);
      const values: Prisma.Sql[] = [];
      for (let i = batchStart; i < batchEnd; i++) {
        const vectorStr = `[${embeddings[i].join(',')}]`;
        values.push(Prisma.sql`(
          ${episode.id}, ${'HOST'}, ${'Citizen Web3'},
          ${null}, ${chunks[i].content}, ${prefixes[i]},
          ${chunks[i].chunkIndex}, ${vectorStr}::vector, ${PODCAST_EMBEDDING_MODEL_ID},
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
    }
  }, { timeout: 30000 });

  logInfo(`Processed CW3 doc "${source.slug}": ${chunks.length} chunks`);
  return true;
};
