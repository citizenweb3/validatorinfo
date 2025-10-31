export interface ParsedGithubUrl {
  owner: string;
  repo?: string;
}

export const parseGithubUrl = (url: string): ParsedGithubUrl => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid GitHub URL: URL must be a non-empty string');
  }

  const cleanUrl = url.trim().replace(/\/+$/, '');

  const patterns = [
    /^https?:\/\/(?:www\.)?github\.com\/([^\/\s]+)(?:\/([^\/\s]+))?/i,
    /^(?:www\.)?github\.com\/([^\/\s]+)(?:\/([^\/\s]+))?/i,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const owner = match[1];
      const repo = match[2];

      if (!owner || owner.length === 0) {
        throw new Error('Invalid GitHub URL: Missing owner/organization name');
      }

      return {
        owner,
        repo,
      };
    }
  }

  throw new Error(`Invalid GitHub URL format: ${url}`);
};

export const getGithubOrganization = (url: string): string => {
  const parsed = parseGithubUrl(url);
  return parsed.owner;
};

export const isValidGithubUrl = (url: string): boolean => {
  try {
    parseGithubUrl(url);
    return true;
  } catch {
    return false;
  }
};
