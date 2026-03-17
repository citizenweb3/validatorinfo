import logger from '@/logger';

const { logInfo, logError, logDebug } = logger('fetch-proposal-text');

const MAX_TEXT_LENGTH = 500_000;
const FETCH_TIMEOUT = 15_000;
const IPFS_FETCH_TIMEOUT = 30_000;
const MIN_IPFS_CID_LENGTH = 10;

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://w3s.link/ipfs/',
];

const BINARY_CONTENT_TYPES = [
  'application/pdf',
  'application/octet-stream',
  'image/',
  'audio/',
  'video/',
];

type UrlType = 'ipfs' | 'github' | 'github-repo' | 'discourse' | 'http';

interface ParsedUrl {
  type: UrlType;
  resolvedUrl: string;
  cid?: string;
  owner?: string;
  repo?: string;
}

const isValidIpfsCid = (cid: string): boolean => {
  if (!cid || cid.length < MIN_IPFS_CID_LENGTH) return false;
  if (cid.toLowerCase() === 'cid') return false;
  return true;
};

const parseProposalUrl = (url: string): ParsedUrl | null => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  if (trimmed.startsWith('ipfs://')) {
    const cid = trimmed.replace('ipfs://', '');
    if (!isValidIpfsCid(cid)) return null;
    return { type: 'ipfs', resolvedUrl: `${IPFS_GATEWAYS[0]}${cid}`, cid };
  }
  if (trimmed.startsWith('/ipfs/')) {
    const cid = trimmed.replace('/ipfs/', '');
    if (!isValidIpfsCid(cid)) return null;
    return { type: 'ipfs', resolvedUrl: `${IPFS_GATEWAYS[0]}${cid}`, cid };
  }

  for (const gateway of IPFS_GATEWAYS) {
    if (trimmed.startsWith(gateway)) {
      const cid = trimmed.replace(gateway, '');
      if (!isValidIpfsCid(cid)) return null;
      return { type: 'ipfs', resolvedUrl: trimmed, cid };
    }
  }

  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    const rawUrl = trimmed
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
    return { type: 'github', resolvedUrl: rawUrl };
  }

  if (trimmed.includes('raw.githubusercontent.com')) {
    return { type: 'github', resolvedUrl: trimmed };
  }

  const githubRepoMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)/);
  if (githubRepoMatch) {
    const owner = githubRepoMatch[1];
    const repo = githubRepoMatch[2].replace(/\/$/, '');
    return {
      type: 'github-repo',
      resolvedUrl: `https://api.github.com/repos/${owner}/${repo}/readme`,
      owner,
      repo,
    };
  }

  const discourseMatch = trimmed.match(/^https?:\/\/forum\.[^/]+\/t\/[^/]+\/(\d+)/);
  if (discourseMatch) {
    const jsonUrl = trimmed.replace(/\/?\d*$/, '') + '.json';
    return { type: 'discourse', resolvedUrl: jsonUrl };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { type: 'http', resolvedUrl: trimmed };
  }

  return null;
};

const fetchWithTimeout = async (url: string, timeout: number = FETCH_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const isBinaryContentType = (contentType: string): boolean =>
  BINARY_CONTENT_TYPES.some((type) => contentType.includes(type));

const stripHtmlTags = (html: string): string => {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
};

export const extractTextFromJson = (json: Record<string, unknown>): string | null => {
  const textFields = ['details', 'summary', 'description', 'abstract', 'body', 'content'];
  const titleFields = ['title', 'name'];

  let title = '';
  let body = '';

  for (const field of titleFields) {
    if (typeof json[field] === 'string' && json[field]) {
      title = json[field] as string;
      break;
    }
  }

  for (const field of textFields) {
    if (typeof json[field] === 'string' && json[field]) {
      const value = json[field] as string;
      if (value.length > body.length) {
        body = value;
      }
    }
  }

  if (!body && !title) return null;
  return title ? `# ${title}\n\n${body}` : body;
};

const fetchGitHubReadme = async (apiUrl: string): Promise<string | null> => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.raw+json',
    'User-Agent': 'validatorinfo-bot',
  };

  const token = process.env.GITHUB_API_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(apiUrl, { headers, signal: controller.signal });

    if (!response.ok) {
      logDebug(`GitHub API ${response.status} for ${apiUrl}`);
      return null;
    }

    let text = await response.text();
    if (!text || text.length === 0) return null;

    if (/<[a-z][^>]*>/i.test(text)) {
      text = stripHtmlTags(text);
    }

    if (!text || text.length === 0) return null;

    return text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) : text;
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchDiscoursePost = async (url: string): Promise<string | null> => {
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    logDebug(`Discourse HTTP ${response.status} for ${url}`);
    return null;
  }

  let json;
  try {
    json = await response.json();
  } catch {
    logDebug(`Discourse returned non-JSON for ${url}`);
    return null;
  }
  const firstPost = json?.post_stream?.posts?.[0];
  if (!firstPost?.cooked) return null;

  const text = stripHtmlTags(firstPost.cooked);
  if (!text || text.length === 0) return null;

  const title = json?.title ? `# ${json.title}\n\n` : '';
  const fullText = `${title}${text}`;

  return fullText.length > MAX_TEXT_LENGTH
    ? fullText.substring(0, MAX_TEXT_LENGTH)
    : fullText;
};

const fetchUrl = async (url: string, timeout?: number): Promise<string | null> => {
  const response = await fetchWithTimeout(url, timeout);

  if (!response.ok) {
    logDebug(`HTTP ${response.status} for ${url}`);
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (isBinaryContentType(contentType)) {
    logDebug(`Skipping binary content (${contentType}) from ${url}`);
    return null;
  }

  const text = await response.text();
  if (!text || text.length === 0) return null;

  const truncated = text.length > MAX_TEXT_LENGTH
    ? text.substring(0, MAX_TEXT_LENGTH)
    : text;

  try {
    const json = JSON.parse(truncated);
    if (typeof json === 'object' && json !== null) {
      return extractTextFromJson(json as Record<string, unknown>);
    }
  } catch {}

  if (contentType.includes('text/html')) {
    const stripped = stripHtmlTags(truncated);
    if (stripped.length > 50) return stripped;
    logDebug(`HTML content too short after stripping from ${url}`);
    return null;
  }

  return truncated;
};

export const fetchProposalText = async (url: string): Promise<string | null> => {
  const parsed = parseProposalUrl(url);
  if (!parsed) {
    logDebug(`Could not parse URL: ${url}`);
    return null;
  }

  try {
    if (parsed.type === 'discourse') {
      logDebug(`Fetching Discourse post: ${parsed.resolvedUrl}`);
      const result = await fetchDiscoursePost(parsed.resolvedUrl);
      if (result) {
        logInfo(`Fetched text from Discourse: ${parsed.resolvedUrl} (${result.length} chars)`);
      }
      return result;
    }

    if (parsed.type === 'github-repo') {
      logDebug(`Fetching GitHub README: ${parsed.resolvedUrl}`);
      const result = await fetchGitHubReadme(parsed.resolvedUrl);
      if (result) {
        logInfo(`Fetched README from GitHub: ${parsed.owner}/${parsed.repo} (${result.length} chars)`);
      }
      return result;
    }

    if (parsed.type === 'ipfs' && parsed.cid) {
      for (const gateway of IPFS_GATEWAYS) {
        try {
          const gatewayUrl = `${gateway}${parsed.cid}`;
          logDebug(`Trying IPFS gateway: ${gatewayUrl}`);
          const result = await fetchUrl(gatewayUrl, IPFS_FETCH_TIMEOUT);
          if (result) {
            logInfo(`Fetched text from IPFS: ${gatewayUrl}`);
            return result;
          }
        } catch (e) {
          logDebug(`IPFS gateway failed: ${gateway} — ${e}`);
        }
      }
      logInfo(`All IPFS gateways failed for CID ${parsed.cid}`);
      return null;
    }

    const result = await fetchUrl(parsed.resolvedUrl);
    if (result) {
      logInfo(`Fetched text from ${parsed.type}: ${parsed.resolvedUrl}`);
    }
    return result;
  } catch (e) {
    logError(`Failed to fetch proposal text from ${url}`, e);
    return null;
  }
};

export const isValidProposalUrl = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  if (trimmed.startsWith('ipfs://')) {
    const cid = trimmed.replace('ipfs://', '');
    return isValidIpfsCid(cid);
  }
  if (trimmed.startsWith('/ipfs/')) {
    const cid = trimmed.replace('/ipfs/', '');
    return isValidIpfsCid(cid);
  }
  return false;
};

export const extractBestUrl = (text: string): string | null => {
  if (!text) return null;

  const keywordMatch = text.match(
    /(?:forum\s*post|discussion(?:\s*link)?|discuss(?:ions)?[-\s]*to)\s*\*{0,2}\s*[:=]?\s*\[?\s*(https?:\/\/[^\s)\]"]+)/i,
  );
  if (keywordMatch) return keywordMatch[1];

  const forumUrls = Array.from(text.matchAll(/https?:\/\/(?:forum\.|commonwealth\.im\/|gov\.)[^\s)\]"]+/gi));
  if (forumUrls.length > 0) return forumUrls[forumUrls.length - 1][0];

  return null;
};
