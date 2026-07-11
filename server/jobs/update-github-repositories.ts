import type { GithubRepository as StoredGithubRepository } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';
import {
  type GithubDailyCommitsResult,
  type GithubRepository,
  getDailyCommits,
  getOpenPullRequestsCountByOwner,
  getOrganizationRepos,
} from '@/server/tools/github-api';
import { getGithubOrganization, isValidGithubUrl } from '@/server/utils/parse-github-url';
import { addUtcDays, getGithubAuthorWindow, toUtcDateString } from '@/utils/github-dev-health';

const { logInfo, logError, logWarn } = logger('update-github-repositories');

export const MAX_AUTHOR_BACKFILLS_PER_RUN = 50;
const FULL_ACTIVITY_WINDOW_DAYS = 365;

interface AuthorBackfillCandidate {
  fullName: string;
  pushedAt: Date;
  authorCoverageFrom: Date | null;
}

interface RepositoryProcessingContext {
  authorBackfillFullNames: Set<string>;
  authorCutoff: Date;
  completedThrough: Date;
  commitCache: Map<string, Promise<GithubDailyCommitsResult>>;
}

export const selectAuthorBackfillFullNames = (
  candidates: AuthorBackfillCandidate[],
  cutoff: Date,
  limit: number = MAX_AUTHOR_BACKFILLS_PER_RUN,
): string[] => {
  const sortedCandidates = [...candidates]
    .filter((candidate) => candidate.pushedAt >= cutoff)
    .sort((a, b) => {
      const aCoverage = a.authorCoverageFrom?.getTime() ?? Number.NEGATIVE_INFINITY;
      const bCoverage = b.authorCoverageFrom?.getTime() ?? Number.NEGATIVE_INFINITY;
      if (aCoverage !== bCoverage) return aCoverage - bCoverage;

      const pushedComparison = b.pushedAt.getTime() - a.pushedAt.getTime();
      return pushedComparison || a.fullName.localeCompare(b.fullName);
    });

  const fullNames: string[] = [];
  const seen = new Set<string>();
  for (const candidate of sortedCandidates) {
    if (seen.has(candidate.fullName)) continue;
    seen.add(candidate.fullName);
    fullNames.push(candidate.fullName);
    if (fullNames.length >= limit) break;
  }
  return fullNames;
};

const getAuthorBackfillFullNames = async (cutoff: Date): Promise<Set<string>> => {
  const candidates = await db.githubRepository.findMany({
    where: {
      pushedAt: { gte: cutoff },
      OR: [{ authorCoverageFrom: null }, { authorCoverageFrom: { gt: cutoff } }],
    },
    select: { fullName: true, pushedAt: true, authorCoverageFrom: true },
  });

  return new Set(selectAuthorBackfillFullNames(candidates, cutoff));
};

const getCachedOrganizationRepos = (
  owner: string,
  cache: Map<string, Promise<GithubRepository[]>>,
): Promise<GithubRepository[]> => {
  const cached = cache.get(owner);
  if (cached) return cached;

  const request = getOrganizationRepos(owner);
  cache.set(owner, request);
  return request;
};

const updateGithubDevHealth = async (
  chainId: number,
  owner: string,
  repositories: GithubRepository[],
  startOfToday: Date,
  pullCountCache: Map<string, Promise<number | null>>,
): Promise<void> => {
  const currentSnapshot = await db.githubDevHealth.findUnique({ where: { chainId } });
  if (currentSnapshot?.issuesUpdatedAt && currentSnapshot.issuesUpdatedAt >= startOfToday) {
    if (!pullCountCache.has(owner)) {
      pullCountCache.set(owner, Promise.resolve(currentSnapshot.openPrsCount));
    }
    return;
  }

  const cachedPullCount = pullCountCache.get(owner);
  const pullCountRequest = cachedPullCount ?? getOpenPullRequestsCountByOwner(owner);
  if (!cachedPullCount) pullCountCache.set(owner, pullCountRequest);

  const openPrsCount = await pullCountRequest;
  if (openPrsCount === null) return;

  const rawOpenIssues = repositories.reduce((sum, repository) => sum + repository.open_issues_count, 0);
  await db.githubDevHealth.upsert({
    where: { chainId },
    create: {
      chainId,
      openPrsCount,
      openIssuesCount: Math.max(0, rawOpenIssues - openPrsCount),
      issuesUpdatedAt: new Date(),
    },
    update: {
      openPrsCount,
      openIssuesCount: Math.max(0, rawOpenIssues - openPrsCount),
      issuesUpdatedAt: new Date(),
    },
  });
};

const getLegacyActivityStart = async (repositoryId: number, completedThrough: Date): Promise<Date | null> => {
  const mostRecentActivity = await db.githubActivity.findFirst({
    where: { repositoryId, date: { lte: completedThrough } },
    select: { date: true },
    orderBy: { date: 'desc' },
  });

  if (!mostRecentActivity) return addUtcDays(completedThrough, -(FULL_ACTIVITY_WINDOW_DAYS - 1));

  const daysSinceLastUpdate = Math.floor(
    (completedThrough.getTime() - mostRecentActivity.date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceLastUpdate === 0) return null;
  if (daysSinceLastUpdate <= 30) return addUtcDays(mostRecentActivity.date, 1);

  logInfo(`Repository ${repositoryId}: activity is ${daysSinceLastUpdate} days old, doing full refresh`);
  return addUtcDays(completedThrough, -(FULL_ACTIVITY_WINDOW_DAYS - 1));
};

const getActivityStart = async (
  repository: StoredGithubRepository,
  shouldBackfillAuthors: boolean,
  authorCutoff: Date,
  completedThrough: Date,
): Promise<Date | null> => {
  const incrementalStart = repository.activityFetchedThrough
    ? addUtcDays(repository.activityFetchedThrough, 1)
    : await getLegacyActivityStart(repository.id, completedThrough);

  if (!shouldBackfillAuthors) {
    return incrementalStart && incrementalStart <= completedThrough ? incrementalStart : null;
  }

  if (!incrementalStart) return authorCutoff;
  return incrementalStart < authorCutoff ? incrementalStart : authorCutoff;
};

const getCachedDailyCommits = (
  fullName: string,
  startDate: string,
  endDate: string,
  cache: Map<string, Promise<GithubDailyCommitsResult>>,
): Promise<GithubDailyCommitsResult> => {
  const key = `${fullName}:${startDate}:${endDate}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const [owner, repository] = fullName.split('/');
  const request = getDailyCommits(owner, repository, startDate, endDate);
  cache.set(key, request);
  return request;
};

const fetchAndStoreActivity = async (
  repository: StoredGithubRepository,
  context: RepositoryProcessingContext,
): Promise<void> => {
  try {
    const shouldBackfillAuthors = context.authorBackfillFullNames.has(repository.fullName);
    const start = await getActivityStart(
      repository,
      shouldBackfillAuthors,
      context.authorCutoff,
      context.completedThrough,
    );
    if (!start) return;

    const startDate = toUtcDateString(start);
    const endDate = toUtcDateString(context.completedThrough);
    const result = await getCachedDailyCommits(repository.fullName, startDate, endDate, context.commitCache);
    const activityWrites = Array.from(result.days.entries()).map(([date, activity]) =>
      db.githubActivity.upsert({
        where: { repositoryId_date: { repositoryId: repository.id, date: new Date(`${date}T00:00:00.000Z`) } },
        create: {
          repositoryId: repository.id,
          date: new Date(`${date}T00:00:00.000Z`),
          commitCount: activity.commitCount,
          additions: 0,
          deletions: 0,
          authorLogins: activity.authorLogins,
        },
        update: { commitCount: activity.commitCount, authorLogins: activity.authorLogins },
      }),
    );

    if (!result.complete) {
      if (activityWrites.length > 0) await db.$transaction(activityWrites);
      logWarn(`Partial GitHub activity result for ${repository.fullName}; coverage was not advanced`);
      return;
    }

    const currentCoverage = repository.authorCoverageFrom;
    const authorCoverageFrom = currentCoverage && currentCoverage < start ? currentCoverage : start;
    await db.$transaction([
      ...activityWrites,
      db.githubRepository.update({
        where: { id: repository.id },
        data: { authorCoverageFrom, activityFetchedThrough: context.completedThrough },
      }),
    ]);
  } catch (error) {
    logError(`Failed to fetch/store activity for ${repository.fullName}:`, error);
  }
};

const processRepository = async (
  chainId: number,
  repository: GithubRepository,
  context: RepositoryProcessingContext,
): Promise<void> => {
  const storedRepository = await db.githubRepository.upsert({
    where: { chainId_fullName: { chainId, fullName: repository.full_name } },
    create: {
      chainId,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      url: repository.html_url,
      homepage: repository.homepage,
      language: repository.language,
      starsCount: repository.stargazers_count,
      forksCount: repository.forks_count,
      watchersCount: repository.watchers_count,
      openIssuesCount: repository.open_issues_count,
      createdAt: new Date(repository.created_at),
      updatedAt: new Date(repository.updated_at),
      pushedAt: new Date(repository.pushed_at),
    },
    update: {
      name: repository.name,
      description: repository.description,
      url: repository.html_url,
      homepage: repository.homepage,
      language: repository.language,
      starsCount: repository.stargazers_count,
      forksCount: repository.forks_count,
      watchersCount: repository.watchers_count,
      openIssuesCount: repository.open_issues_count,
      updatedAt: new Date(repository.updated_at),
      pushedAt: new Date(repository.pushed_at),
    },
  });

  await fetchAndStoreActivity(storedRepository, context);
};

const updateGithubRepositories = async (chainNames: string[]) => {
  const { cutoff: authorCutoff, completedThrough } = getGithubAuthorWindow();
  const authorBackfillFullNames = await getAuthorBackfillFullNames(authorCutoff);
  const context: RepositoryProcessingContext = {
    authorBackfillFullNames,
    authorCutoff,
    completedThrough,
    commitCache: new Map(),
  };
  const repositoryCache = new Map<string, Promise<GithubRepository[]>>();
  const pullCountCache = new Map<string, Promise<number | null>>();
  const startOfToday = addUtcDays(completedThrough, 1);

  for (const chainName of chainNames) {
    try {
      const chain = getChainParams(chainName);
      const dbChain = await db.chain.findFirst({ where: { chainId: chain.chainId } });
      if (!dbChain) {
        logError(`Chain ${chain.chainId} not found in database`);
        continue;
      }
      if (!isValidGithubUrl(chain.githubUrl)) {
        logError(`Invalid GitHub URL for ${chain.name}: ${chain.githubUrl}`);
        continue;
      }

      const owner = getGithubOrganization(chain.githubUrl);
      const repositories = await getCachedOrganizationRepos(owner, repositoryCache);
      if (repositories.length === 0) {
        logError(`No repositories found for ${chain.name} (${owner})`);
        continue;
      }

      logInfo(`Processing ${repositories.length} repositories for ${chain.name} (${owner})`);
      await updateGithubDevHealth(dbChain.id, owner, repositories, startOfToday, pullCountCache);

      for (const repository of repositories) {
        try {
          await processRepository(dbChain.id, repository, context);
        } catch (error) {
          logError(`Failed to process repository ${repository.full_name}:`, error);
        }
      }
    } catch (error) {
      logError(`Failed to process chain ${chainName}:`, error);
    }
  }

  logInfo('GitHub repositories update completed.');
};

export default updateGithubRepositories;
