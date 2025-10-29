import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';
import { type GithubRepository, getDailyCommits, getOrganizationRepos } from '@/server/tools/github-api';
import { getGithubOrganization, isValidGithubUrl } from '@/server/utils/parse-github-url';

const { logInfo, logError } = logger('update-github-repositories');

const updateGithubRepositories = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chain = getChainParams(chainName);

    const dbChain = await db.chain.findFirst({
      where: { chainId: chain.chainId },
    });
    if (!dbChain) {
      logError(`Chain ${chain.chainId} not found in database`);
      continue;
    }

    let totalReposProcessed = 0;

    try {
      logInfo(`Processing chain: ${chain.name}`);

      if (!isValidGithubUrl(chain.githubUrl)) {
        logError(`Invalid GitHub URL for ${chain.name}: ${chain.githubUrl}`);
        continue;
      }

      const orgName = getGithubOrganization(chain.githubUrl);
      logInfo(`Fetching repositories for organization: ${orgName}`);

      const repos = await getOrganizationRepos(orgName);

      if (repos.length === 0) {
        logError(`No repositories found for ${chain.name} (${orgName})`);
        continue;
      }

      logInfo(`Found ${repos.length} repositories for ${chain.name}`);

      for (const repo of repos) {
        try {
          await processRepository(dbChain.id, repo);
          totalReposProcessed++;
        } catch (e) {
          logError(`Failed to process repository ${repo.full_name}:`, e);
          continue;
        }
      }
    } catch (e) {
      logError(`Failed to process chain ${chain.name}:`, e);
      continue;
    }
  }

  logInfo(`GitHub repositories update completed.`);
};

const processRepository = async (chainId: number, repo: GithubRepository): Promise<void> => {
  const dbRepo = await db.githubRepository.upsert({
    where: {
      chainId_fullName: { chainId, fullName: repo.full_name },
    },
    create: {
      chainId,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      starsCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      watchersCount: repo.watchers_count,
      openIssuesCount: repo.open_issues_count,
      createdAt: new Date(repo.created_at),
      updatedAt: new Date(repo.updated_at),
      pushedAt: new Date(repo.pushed_at),
    },
    update: {
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      starsCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      watchersCount: repo.watchers_count,
      openIssuesCount: repo.open_issues_count,
      updatedAt: new Date(repo.updated_at),
      pushedAt: new Date(repo.pushed_at),
    },
  });

  await fetchAndStoreActivity(dbRepo.id, repo.full_name);
};

const fetchAndStoreActivity = async (repositoryId: number, fullName: string): Promise<void> => {
  try {
    const [owner, repo] = fullName.split('/');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const existingDates = await db.githubActivity.findMany({
      where: { repositoryId },
      select: { date: true },
    });

    let actualStartDate = startDateStr;
    let skipFetch = false;

    if (existingDates.length > 0) {
      const mostRecentDate = new Date(Math.max(...existingDates.map((d) => d.date.getTime())));
      const daysSinceLastUpdate = Math.floor((endDate.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastUpdate === 0) {
        skipFetch = true;
      } else if (daysSinceLastUpdate <= 30) {
        const nextDay = new Date(mostRecentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        actualStartDate = nextDay.toISOString().split('T')[0];
      } else {
        logInfo(`${fullName}: Data is ${daysSinceLastUpdate} days old, doing full 365-day refresh`);
      }
    }

    if (skipFetch) {
      return;
    }

    const dailyCommits = await getDailyCommits(owner, repo, actualStartDate, endDateStr);

    if (dailyCommits.size === 0) {
      return;
    }

    for (const [dateStr, commitCount] of Array.from(dailyCommits.entries())) {
      const date = new Date(dateStr);

      await db.githubActivity.upsert({
        where: {
          repositoryId_date: {
            repositoryId,
            date,
          },
        },
        create: {
          repositoryId,
          date,
          commitCount,
          additions: 0,
          deletions: 0,
        },
        update: {
          commitCount,
        },
      });
    }
  } catch (e) {
    logError(`Failed to fetch/store activity for ${fullName}:`, e);
  }
};

export default updateGithubRepositories;
