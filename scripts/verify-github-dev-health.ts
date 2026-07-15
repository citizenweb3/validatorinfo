import assert from 'node:assert/strict';

import { selectAuthorBackfillFullNames } from '@/server/jobs/update-github-repositories';
import { getDailyCommits, getOpenPullRequestsCountByOwner } from '@/server/tools/github-api';
import { getActiveContributorsCount, type GithubContributorRepository } from '@/services/github-service';
import { getGithubContributorWindow, toUtcDateString } from '@/utils/github-dev-health';

const originalFetch = global.fetch;

const jsonResponse = (body: unknown, status: number = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '100' },
  });

const rateLimitResponse = (): Response =>
  jsonResponse({ resources: { core: { limit: 5000, remaining: 4999, reset: 0 } } });

const verifyPullRequestCounts = async () => {
  global.fetch = async () => jsonResponse({ total_count: 17, incomplete_results: false });
  assert.equal(await getOpenPullRequestsCountByOwner('example'), 17);

  global.fetch = async () => jsonResponse({ total_count: 17, incomplete_results: true });
  assert.equal(await getOpenPullRequestsCountByOwner('example'), null);

  global.fetch = async () => jsonResponse({ total_count: '17', incomplete_results: false });
  assert.equal(await getOpenPullRequestsCountByOwner('example'), null);

  global.fetch = async () => jsonResponse({ message: 'not found' }, 404);
  assert.equal(await getOpenPullRequestsCountByOwner('example'), null);
};

const verifyCommitExtraction = async () => {
  const responses = [
    rateLimitResponse(),
    jsonResponse([
      {
        author: { login: 'alice' },
        commit: { author: { date: '2026-07-10T08:00:00.000Z' } },
      },
      {
        author: { login: 'alice' },
        commit: { author: { date: '2026-07-10T09:00:00.000Z' } },
      },
      {
        author: { login: 'dependabot[bot]' },
        commit: { author: { date: '2026-07-10T10:00:00.000Z' } },
      },
      {
        author: { login: 'UPDATER[BOT]' },
        commit: { author: { date: '2026-07-10T11:00:00.000Z' } },
      },
      {
        author: null,
        commit: { author: { date: '2026-07-11T01:00:00.000Z' } },
      },
    ]),
  ];
  global.fetch = async () => responses.shift() ?? jsonResponse([]);

  const result = await getDailyCommits('example', 'repo', '2026-07-10', '2026-07-11');
  assert.equal(result.complete, true);
  assert.deepEqual(result.days.get('2026-07-10'), { commitCount: 4, authorLogins: ['alice'] });
  assert.deepEqual(result.days.get('2026-07-11'), { commitCount: 1, authorLogins: [] });
};

const verifyPartialCommitResult = async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => ({
    author: { login: index % 2 === 0 ? 'alice' : 'bob' },
    commit: { author: { date: '2026-07-10T08:00:00.000Z' } },
  }));
  const responses = [rateLimitResponse(), jsonResponse(firstPage), rateLimitResponse(), jsonResponse({}, 500)];
  global.fetch = async () => responses.shift() ?? jsonResponse([]);

  const result = await getDailyCommits('example', 'repo', '2026-07-10', '2026-07-10');
  assert.equal(result.complete, false);
  assert.deepEqual(result.days.get('2026-07-10'), {
    commitCount: 100,
    authorLogins: ['alice', 'bob'],
  });
};

const verifyBackfillSelection = () => {
  const cutoff = new Date('2026-06-11T00:00:00.000Z');
  const candidates = [
    { fullName: 'org/a', pushedAt: new Date('2026-07-10'), authorCoverageFrom: null },
    { fullName: 'org/a', pushedAt: new Date('2026-07-09'), authorCoverageFrom: null },
    { fullName: 'org/b', pushedAt: new Date('2026-07-08'), authorCoverageFrom: new Date('2026-07-01') },
    { fullName: 'org/c', pushedAt: new Date('2026-01-01'), authorCoverageFrom: null },
  ];

  assert.deepEqual(selectAuthorBackfillFullNames(candidates, cutoff, 2), ['org/a', 'org/b']);

  const window = getGithubContributorWindow(new Date('2026-07-11T12:00:00.000Z'));
  assert.equal(toUtcDateString(window.completedThrough), '2026-07-10');
  assert.equal(toUtcDateString(window.cutoff), '2026-06-11');
};

const verifyActiveContributorUnion = () => {
  const coverageFrom = new Date('2026-06-11T00:00:00.000Z');
  const fetchedThrough = new Date('2026-07-10T00:00:00.000Z');
  const repositories: GithubContributorRepository[] = [
    {
      pushedAt: new Date('2026-07-09T00:00:00.000Z'),
      authorCoverageFrom: coverageFrom,
      activityFetchedThrough: fetchedThrough,
      activities: [
        { date: new Date('2026-06-10T00:00:00.000Z'), authorLogins: ['outside-window'] },
        { date: new Date('2026-07-09T00:00:00.000Z'), authorLogins: ['alice', 'bob', 'release[bot]'] },
      ],
    },
    {
      pushedAt: new Date('2026-07-08T00:00:00.000Z'),
      authorCoverageFrom: coverageFrom,
      activityFetchedThrough: fetchedThrough,
      activities: [
        { date: new Date('2026-07-08T00:00:00.000Z'), authorLogins: ['bob', 'carol', 42] },
      ],
    },
    {
      pushedAt: new Date('2026-01-01T00:00:00.000Z'),
      authorCoverageFrom: null,
      activityFetchedThrough: null,
      activities: [],
    },
  ];

  const now = new Date('2026-07-12T12:00:00.000Z');
  assert.equal(getActiveContributorsCount(repositories, now), 3);

  const incompleteRepositories = repositories.map((repository, index) =>
    index === 0 ? { ...repository, authorCoverageFrom: null } : repository,
  );
  assert.equal(getActiveContributorsCount(incompleteRepositories, now), null);

  const staleRepositories = repositories.map((repository, index) =>
    index < 2 ? { ...repository, activityFetchedThrough: new Date('2026-07-09T00:00:00.000Z') } : repository,
  );
  assert.equal(getActiveContributorsCount(staleRepositories, now), null);
};

const run = async () => {
  try {
    await verifyPullRequestCounts();
    await verifyCommitExtraction();
    await verifyPartialCommitResult();
    verifyBackfillSelection();
    verifyActiveContributorUnion();
    console.log('GitHub dev-health verification passed');
  } finally {
    global.fetch = originalFetch;
  }
};

void run();
