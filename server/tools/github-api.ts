import logger from '@/logger';

const { logInfo, logError, logWarn } = logger('github-api');

interface GithubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

interface GithubCommitActivity {
  days: number[];
  total: number;
  week: number;
}

interface GithubContributorStats {
  author: {
    login: string;
    id: number;
  };
  total: number;
  weeks: Array<{
    w: number;
    a: number;
    d: number;
    c: number;
  }>;
}

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ValidatorInfo-Indexer',
  };

  if (GITHUB_API_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_API_TOKEN}`;
  } else {
    logWarn('GITHUB_API_TOKEN not set - using unauthenticated requests (rate limit: 60/hour)');
  }

  return headers;
};

export const checkRateLimit = async (): Promise<GithubRateLimit | null> => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: getHeaders(),
    });

    const data = await response.json();
    const coreLimit = data.resources.core;

    return {
      limit: coreLimit.limit,
      remaining: coreLimit.remaining,
      reset: coreLimit.reset,
    };
  } catch (error) {
    logError('Failed to check rate limit:', error);
    return null;
  }
};

const handleRateLimit = async (headers: Headers): Promise<void> => {
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');

  if (remaining && parseInt(remaining) === 0 && reset) {
    const resetTime = parseInt(reset) * 1000;
    const waitTime = resetTime - Date.now() + 1000;

    if (waitTime > 0) {
      logWarn(`Rate limit exhausted. Waiting ${Math.ceil(waitTime / 1000)}s until reset...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

const waitForRateLimitIfNeeded = async (threshold: number = 10): Promise<void> => {
  const rateLimit = await checkRateLimit();

  if (rateLimit && rateLimit.remaining < threshold) {
    const resetTime = rateLimit.reset * 1000;
    const waitTime = resetTime - Date.now() + 1000;

    if (waitTime > 0) {
      logWarn(
        `Rate limit low (${rateLimit.remaining} remaining). Waiting ${Math.ceil(waitTime / 1000)}s until reset...`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

export const getOrganizationRepos = async (orgName: string): Promise<GithubRepository[]> => {
  const repos: GithubRepository[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const url = `${GITHUB_API_BASE}/orgs/${orgName}/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      await handleRateLimit(response.headers);

      if (!response.ok) {
        if (response.status === 404) {
          logError(`Organization not found: ${orgName}`);
          return [];
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as GithubRepository[];

      if (data.length === 0) {
        break;
      }

      repos.push(...data);

      if (data.length < perPage) {
        break;
      }

      page++;
    }

    logInfo(`Fetched ${repos.length} repositories for organization: ${orgName}`);
    return repos;
  } catch (error) {
    logError(`Failed to fetch repos for ${orgName}:`, error);
    throw error;
  }
};

export const getRepositoryStats = async (owner: string, repo: string): Promise<GithubRepository | null> => {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    await handleRateLimit(response.headers);

    if (!response.ok) {
      if (response.status === 404) {
        logWarn(`Repository not found: ${owner}/${repo}`);
        return null;
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as GithubRepository;
    return data;
  } catch (error) {
    logError(`Failed to fetch stats for ${owner}/${repo}:`, error);
    throw error;
  }
};

export const getRepositoryActivity = async (owner: string, repo: string): Promise<GithubCommitActivity[]> => {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/commit_activity`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    await handleRateLimit(response.headers);

    if (!response.ok) {
      if (response.status === 404) {
        logWarn(`Repository not found: ${owner}/${repo}`);
        return [];
      }
      if (response.status === 202) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return getRepositoryActivity(owner, repo);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as GithubCommitActivity[];
    return data || [];
  } catch (error) {
    logError(`Failed to fetch activity for ${owner}/${repo}:`, error);
    return [];
  }
};

export const getRepositoryContributorStats = async (owner: string, repo: string): Promise<GithubContributorStats[]> => {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/contributors`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    await handleRateLimit(response.headers);

    if (!response.ok) {
      if (response.status === 404) {
        logWarn(`Repository not found: ${owner}/${repo}`);
        return [];
      }
      if (response.status === 202) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return getRepositoryContributorStats(owner, repo);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as GithubContributorStats[];
    return data || [];
  } catch (error) {
    logError(`Failed to fetch contributor stats for ${owner}/${repo}:`, error);
    return [];
  }
};

export const getAggregatedWeeklyActivity = async (
  owner: string,
  repo: string,
): Promise<Map<number, { commits: number; additions: number; deletions: number }>> => {
  const contributors = await getRepositoryContributorStats(owner, repo);
  const weeklyData = new Map<number, { commits: number; additions: number; deletions: number }>();

  for (const contributor of contributors) {
    for (const week of contributor.weeks) {
      const existing = weeklyData.get(week.w) || { commits: 0, additions: 0, deletions: 0 };
      weeklyData.set(week.w, {
        commits: existing.commits + week.c,
        additions: existing.additions + week.a,
        deletions: existing.deletions + week.d,
      });
    }
  }

  return weeklyData;
};

export const getDailyCommits = async (
  owner: string,
  repo: string,
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> => {
  const dailyCommits = new Map<string, number>();

  const start = new Date(startDate);
  const end = new Date(endDate);

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  try {
    logInfo(`Fetching daily commits for ${owner}/${repo} from ${startDate} to ${endDate} (${totalDays} days)`);

    const startTime = new Date(start);
    startTime.setDate(startTime.getDate() - 7);
    const endTime = new Date(end);
    endTime.setDate(endTime.getDate() + 1);

    let page = 1;
    const perPage = 100;
    let hasMorePages = true;

    while (hasMorePages) {
      await waitForRateLimitIfNeeded(50);

      const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?since=${startTime.toISOString()}&until=${endTime.toISOString()}&per_page=${perPage}&page=${page}`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      await handleRateLimit(response.headers);

      if (!response.ok) {
        if (response.status === 404) {
          logError(`Repository not found: ${owner}/${repo}`);
          return dailyCommits;
        }
        if (response.status === 409) {
          logInfo(`Repository ${owner}/${repo} is empty or has no commits`);
          return dailyCommits;
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        hasMorePages = false;
        break;
      }

      for (const commit of data) {
        const commitDate = new Date(commit.commit.author.date);
        const commitDateStr = commitDate.toISOString().split('T')[0];

        if (commitDateStr >= startDate && commitDateStr <= endDate) {
          const existing = dailyCommits.get(commitDateStr) || 0;
          dailyCommits.set(commitDateStr, existing + 1);
        }
      }

      if (data.length < perPage) {
        hasMorePages = false;
      } else {
        page++;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logInfo(`Completed fetching daily commits for ${owner}/${repo}: ${dailyCommits.size} days with commits`);
    return dailyCommits;
  } catch (error) {
    logError(`Failed to fetch daily commits for ${owner}/${repo}:`, error);
    logInfo(`Returning partial data: ${dailyCommits.size} days processed out of ${totalDays}`);
    return dailyCommits;
  }
};

export type { GithubRepository, GithubCommitActivity, GithubContributorStats };
