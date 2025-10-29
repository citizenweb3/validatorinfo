import { Prisma } from '@prisma/client';

import db from '@/db';

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
}

export interface DailyActivity {
  date: Date;
  commits: number;
  level: number;
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

const getStats = async (chainId: number): Promise<GithubStats> => {
  const repositories = await getByChainId(chainId);

  if (repositories.length === 0) {
    return {
      totalStars: 0,
      totalForks: 0,
      repositoryCount: 0,
      mostActiveRepoCommits: 0,
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
  };
};

const getActivityData = async (chainId: number): Promise<DailyActivity[]> => {
  const repositories = await getByChainId(chainId);

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
  const today = new Date();
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

const githubService = {
  getByChainId,
  getRepositoriesWithCommits,
  getStats,
  getActivityData,
};

export default githubService;
