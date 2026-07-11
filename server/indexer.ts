import { CronJob } from 'cron';
import { Worker } from 'worker_threads';

import logger from '@/logger';
import chains from '@/server/tools/chains/chains';

import './instrumentation';

const timers = {
  every5mins: '*/5 * * * *',
  every10mins: '*/10 * * * *',
  every30mins: '*/30 * * * *',
  everyHour: '0 * * * *',
  every6hours: '0 */6 * * *',
  everyDay: '0 0 * * *',
  in15MinEveryHour: '15 * * * *',
  in30MinEveryHour: '30 * * * *',
  in45MinEveryHour: '45 * * * *',
};

// everyDay tasks are spread across the day (previously all fired at 00:00). Each task runs in its
// own worker thread that builds its own Prisma clients — ~100 connections per worker (50 main +
// 50 events pool, both created in src/db.ts under NODE_ENV=production); firing the daily tasks
// together — plus the everyHour / every6hours crons that also land on 00:00 — far exceeded
// Postgres max_connections (500, see docker-compose) and timed out the pool
// (PrismaClientInitializationError on the first query).
// Minutes stay off :00/:15/:30/:45 to also dodge the hourly / 30-min / 45-min / 15-min crons.
const dailyAt = (hour: number, minute: number) => `${minute} ${hour} * * *`;

const { logInfo, logError } = logger('indexer');

const runServer = async () => {
  logInfo('Starting indexer server');
  const tasksRunning: Record<string, boolean> = {};

  // Initial (boot) runs are staggered, not fired all at once: each task spawns a worker thread
  // that opens ~100 connections (50 main + 50 events pool), so a synchronous burst exhausts
  // Postgres max_connections (500). tasks[] starts immediately; specialTasks waits 10 min for
  // validators to load.
  const INITIAL_RUN_DELAY_MS = 10 * 60 * 1000;
  const INITIAL_STAGGER_MS = 30 * 1000;

  async function spawnTask(taskName: string, chains: string[]) {
    if (tasksRunning[taskName]) {
      logInfo(`${taskName} already running, skipping.`);
      return Promise.resolve();
    }
    tasksRunning[taskName] = true;
    logInfo(`Starting task ${taskName}`);
    return new Promise<void>((resolve, reject) => {
      // @ts-ignore
      const worker = new Worker(new URL('./task-worker.ts', import.meta.url), {
        workerData: { taskName, chains },
        execArgv: ['-r', 'tsconfig-paths/register', '-r', 'ts-node/register'],
      });
      worker.on('message', (msg) => {
        logInfo(`${taskName} finished: ${msg}`);
      });
      worker.on('error', (err) => {
        logError(`${taskName} error:`, err);
        tasksRunning[taskName] = false;
        reject(err);
      });
      worker.on('exit', (code) => {
        tasksRunning[taskName] = false;
        if (code !== 0) {
          logError(`${taskName} stopped with exit code ${code}`);
          reject(new Error(`Worker stopped with exit code ${code}`));
        } else {
          resolve();
        }
      });
    });
  }

  const tasks = [
    // update-nodes-votes runs in specialTasks (spread via dailyAt); kept out here to avoid a
    // duplicate schedule plus the immediate boot run.
    { name: 'sync-aztec-events', schedule: timers.every10mins },
    { name: 'prices', schedule: timers.every5mins },
    { name: 'validators', schedule: timers.everyHour },
    { name: 'chain-tvls', schedule: timers.everyHour },
    { name: 'chain-aprs', schedule: timers.in15MinEveryHour },
    { name: 'active-set-min-amount', schedule: timers.in45MinEveryHour },
    // everyDay jobs spread across the day. chain-proposals + proposal-params run BEFORE
    // update-nodes-votes (02:23 in specialTasks) so votes match already-indexed proposals.
    { name: 'chain-proposals', schedule: dailyAt(1, 7) },
    { name: 'proposal-params', schedule: dailyAt(1, 43) },
    { name: 'update-reward-address', schedule: dailyAt(5, 13) },
    { name: 'chain-staking-params', schedule: dailyAt(7, 7) },
    { name: 'chain-slashing-params', schedule: dailyAt(10, 23) },
    { name: 'chain-node-params', schedule: dailyAt(12, 43) },
    { name: 'community-tax', schedule: dailyAt(14, 53) },
    { name: 'wallets-amount', schedule: dailyAt(16, 43) },
    { name: 'update-staking-page-json', schedule: dailyAt(17, 23) },
    { name: 'community-pool', schedule: dailyAt(19, 43) },
    { name: 'inflation-rate', schedule: dailyAt(20, 23) },
  ];

  tasks.forEach((task) => {
    const job = new CronJob(
      task.schedule,
      async () => {
        logInfo(`Scheduled run for task ${task.name}`);
        try {
          await spawnTask(task.name, chains);
        } catch (e) {
          logError(`Error in task ${task.name}: ${e}`);
        }
      },
      null,
      true,
    );
    job.start();
  });

  // Staggered boot run (see INITIAL_STAGGER_MS): do not spawn all tasks[] workers at once.
  tasks.forEach((task, i) => {
    setTimeout(
      () => spawnTask(task.name, chains).catch((e) => logError(`Initial run error for task ${task.name}:`, e)),
      i * INITIAL_STAGGER_MS,
    );
  });

  const specialTasks: Array<{ name: string; schedule: string }> = [
    { name: 'validatorInfo', schedule: dailyAt(0, 7) },
    { name: 'update-aztec-sequencer-stake', schedule: timers.everyHour },
    { name: 'update-aztec-coinbase-address', schedule: timers.everyHour },
    { name: 'slashing-infos', schedule: timers.every10mins },
    // Depends on chain-proposals having populated the proposals table (else votes are dropped as
    // "proposal not found"). Scheduled safe (chain-proposals 01:07 < 02:23). At boot it relies on
    // chain-proposals (boot ~3min) finishing before this fires (~12min); a mismatch self-heals at
    // the next 02:23 run. Keep chain-proposals earlier than this if the stagger/order changes.
    { name: 'update-nodes-votes', schedule: dailyAt(2, 23) },
    { name: 'update-nodes-rewards', schedule: timers.everyHour },
    { name: 'update-nodes-commissions', schedule: timers.everyHour },
    { name: 'circulating-tokens-onchain', schedule: dailyAt(3, 37) },
    { name: 'circulating-tokens-public', schedule: dailyAt(4, 53) },
    { name: 'coingecko-data', schedule: timers.in30MinEveryHour },
    { name: 'price-history', schedule: dailyAt(6, 13) },
    { name: 'update-fdv', schedule: timers.everyHour },
    { name: 'update-delegators-amount', schedule: dailyAt(8, 7) },
    { name: 'update-average-delegation', schedule: timers.in45MinEveryHour },
    { name: 'github-repositories', schedule: dailyAt(9, 43) },
    { name: 'unbonding-tokens', schedule: dailyAt(11, 23) },
    { name: 'match-chain-nodes', schedule: dailyAt(13, 37) },
    { name: 'check-nodes-health', schedule: timers.everyHour },
    { name: 'update-chain-rewards', schedule: timers.everyHour },
    { name: 'update-twitter-followers-amount', schedule: dailyAt(15, 53) },
    { name: 'update-community-members', schedule: dailyAt(18, 13) },
    { name: 'update-validators-aztec-logos', schedule: timers.everyHour },
    { name: 'sync-aztec-committee', schedule: timers.every10mins },
    { name: 'update-aztec-l1-contracts', schedule: timers.every6hours },
    { name: 'update-aztec-governance-data', schedule: timers.every30mins },
    { name: 'update-aztec-tvs-history', schedule: timers.every6hours },
    { name: 'update-aztec-apr-history', schedule: timers.every6hours },
    { name: 'update-aztec-validators-history', schedule: timers.every6hours },
    { name: 'update-aztec-node-distribution', schedule: timers.every6hours },
    { name: 'update-aztec-total-earned-rewards', schedule: timers.every6hours },
    { name: 'update-tx-metrics', schedule: dailyAt(21, 7) },
    { name: 'update-proposal-texts', schedule: timers.every10mins },
    { name: 'update-validator-ranks', schedule: timers.every6hours },
    { name: 'monero-network-info', schedule: timers.every5mins },
    { name: 'monero-pool-attribution', schedule: timers.every10mins },
    { name: 'monero-pool-stats', schedule: timers.everyHour },
    { name: 'monero-pool-daily-share', schedule: dailyAt(22, 23) },
  ];

  specialTasks.forEach(({ name, schedule }) => {
    const job = new CronJob(
      schedule,
      async () => {
        logInfo(`Scheduled run for task ${name}`);
        try {
          await spawnTask(name, chains);
        } catch (e) {
          logError(`Error in task ${name}: ${e}`);
        }
      },
      null,
      true,
    );
    job.start();
  });

  // Initial run for specialTasks, 10 minutes after boot (wait for validators to be updated).
  // Staggered, NOT fired all at once (see INITIAL_STAGGER_MS): each task runs in its own worker
  // thread that opens ~100 connections (50 main + 50 events pool); spawning all specialTasks
  // together exhausts Postgres max_connections (500). Palliative — spreads start times, not a
  // hard concurrency cap.
  specialTasks.forEach(({ name }, i) => {
    setTimeout(
      () => spawnTask(name, chains).catch((e) => logError(`Initial run error for task ${name}:`, e)),
      INITIAL_RUN_DELAY_MS + i * INITIAL_STAGGER_MS,
    );
  });
};

runServer();
