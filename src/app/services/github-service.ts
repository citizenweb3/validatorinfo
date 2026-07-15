import { type GithubDevHealth, Prisma } from '@prisma/client';

import db from '@/db';
import {
  addUtcDays,
  GITHUB_CONTRIBUTOR_WINDOW_DAYS,
  getGithubContributorWindow,
} from '@/utils/github-dev-health';

export type GithubRepositoryWithActivity = Prisma.GithubRepositoryGetPayload<{
  include: { activities: true };
}>;

export type GithubRepositoryWithCommitCount = Prisma.GithubRepositoryGetPayload<{
  include: { activities: true };
}> & {
  totalCommits: number;
};

export interface GithubStats {
  totalStars: number;
  totalForks: number;
  repositoryCount: number;
  mostActiveRepoCommits: number;
  openPrs: number | null;
  openIssues: number | null;
  activeContributors: number | null;
}

export interface DailyActivity {
  date: Date;
  commits: number;
  level: number;
}

export interface GithubContributorRepository {
  pushedAt: Date;
  authorCoverageFrom: Date | null;
  activityFetchedThrough: Date | null;
  activities: Array<{ date: Date; authorLogins: Prisma.JsonValue | null }>;
}

const getByChainId = async (chainId: number): Promise<GithubRepositoryWithActivity[]> => {
  return db.githubRepository.findMany({
    where: {
      chainId,
    },
    include: {
      activities: {
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { starsCount: 'desc' },
  });
};

const getRepositoriesWithCommits = async (chainId: number): Promise<GithubRepositoryWithCommitCount[]> => {
  const repositories = await getByChainId(chainId);

  return repositories.map((repo) => {
    const totalCommits = repo.activities.reduce((sum: number, activity) => sum + activity.commitCount, 0);
    return {
      ...repo,
      totalCommits,
    };
  });
};

const MAX_CONTRIBUTOR_LAG_DAYS = 1;

export const getActiveContributorsCount = (
  repositories: GithubContributorRepository[],
  now: Date = new Date(),
): number | null => {
  const targetWindow = getGithubContributorWindow(now);
  const candidateCutoff = addUtcDays(targetWindow.cutoff, -MAX_CONTRIBUTOR_LAG_DAYS);
  const candidateRepositories = repositories.filter((repository) => repository.pushedAt >= candidateCutoff);

  if (candidateRepositories.length === 0) return 0;

  let completedThrough = targetWindow.completedThrough;
  for (const repository of candidateRepositories) {
    if (repository.activityFetchedThrough === null) return null;
    if (repository.activityFetchedThrough < completedThrough) {
      completedThrough = repository.activityFetchedThrough;
    }
  }

  const minimumFreshDate = addUtcDays(targetWindow.completedThrough, -MAX_CONTRIBUTOR_LAG_DAYS);
  if (completedThrough < minimumFreshDate) return null;

  const cutoff = addUtcDays(completedThrough, -(GITHUB_CONTRIBUTOR_WINDOW_DAYS - 1));
  const activeRepositories = repositories.filter((repository) => repository.pushedAt >= cutoff);

  const hasCompleteCoverage = activeRepositories.every(
    (repository) =>
      repository.authorCoverageFrom !== null &&
      repository.authorCoverageFrom <= cutoff &&
      repository.activityFetchedThrough !== null &&
      repository.activityFetchedThrough >= completedThrough,
  );
  if (!hasCompleteCoverage) return null;

  const logins = new Set<string>();
  for (const repository of activeRepositories) {
    for (const activity of repository.activities) {
      if (activity.date < cutoff || activity.date > completedThrough || !Array.isArray(activity.authorLogins)) {
        continue;
      }
      for (const login of activity.authorLogins) {
        if (typeof login === 'string' && !login.toLowerCase().endsWith('[bot]')) logins.add(login);
      }
    }
  }
  return logins.size;
};

const getStatsFromRepositories = (
  repositories: GithubRepositoryWithActivity[],
  devHealth: GithubDevHealth | null,
  now: Date = new Date(),
): GithubStats => {
  if (repositories.length === 0) {
    return {
      totalStars: 0,
      totalForks: 0,
      repositoryCount: 0,
      mostActiveRepoCommits: 0,
      openPrs: null,
      openIssues: null,
      activeContributors: null,
    };
  }

  const totalStars = repositories.reduce((sum: number, repo) => sum + repo.starsCount, 0);
  const totalForks = repositories.reduce((sum: number, repo) => sum + repo.forksCount, 0);

  const repoCommits = repositories.map((repo) => {
    return repo.activities.reduce((sum: number, activity) => sum + activity.commitCount, 0);
  });

  const mostActiveRepoCommits = repoCommits.length > 0 ? Math.max(...repoCommits) : 0;

  return {
    totalStars,
    totalForks,
    repositoryCount: repositories.length,
    mostActiveRepoCommits,
    openPrs: devHealth?.openPrsCount ?? null,
    openIssues: devHealth?.openIssuesCount ?? null,
    activeContributors: getActiveContributorsCount(repositories, now),
  };
};

const getActivityDataFromRepositories = (
  repositories: GithubRepositoryWithActivity[],
  now: Date = new Date(),
): DailyActivity[] => {
  const dailyMap = new Map<string, number>();

  for (const repo of repositories) {
    for (const activity of repo.activities) {
      const dayKey = activity.date.toISOString().split('T')[0];
      const existing = dailyMap.get(dayKey) || 0;
      dailyMap.set(dayKey, existing + activity.commitCount);
    }
  }

  const maxCommits = Math.max(...Array.from(dailyMap.values()), 0);

  const result: DailyActivity[] = [];
  const today = new Date(now);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 365);

  for (let i = 0; i <= 365; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);

    const dateStr = currentDate.toISOString().split('T')[0];
    const commits = dailyMap.get(dateStr) || 0;

    let level = 0;
    if (commits > 0) {
      level = Math.min(4, Math.ceil((commits / maxCommits) * 4));
    }

    result.push({
      date: currentDate,
      commits,
      level,
    });
  }

  return result;
};

const getStats = async (chainId: number): Promise<GithubStats> => {
  const [repositories, devHealth] = await Promise.all([
    getByChainId(chainId),
    db.githubDevHealth.findUnique({ where: { chainId } }),
  ]);
  return getStatsFromRepositories(repositories, devHealth);
};

const getActivityData = async (chainId: number): Promise<DailyActivity[]> => {
  const repositories = await getByChainId(chainId);
  return getActivityDataFromRepositories(repositories);
};

const getDeveloperActivity = async (
  chainId: number,
): Promise<{ stats: GithubStats; activityData: DailyActivity[] }> => {
  const [repositories, devHealth] = await Promise.all([
    getByChainId(chainId),
    db.githubDevHealth.findUnique({ where: { chainId } }),
  ]);

  return {
    stats: getStatsFromRepositories(repositories, devHealth),
    activityData: getActivityDataFromRepositories(repositories),
  };
};

const githubService = {
  getByChainId,
  getRepositoriesWithCommits,
  getStats,
  getActivityData,
  getDeveloperActivity,
};

export default githubService;
