import { CronJob } from 'cron';
import { Worker } from 'worker_threads';

import logger from '@/logger';
import chains from '@/server/tools/chains/chains';

const timers = {
  every5mins: '*/5 * * * *',
  everyHour: '0 * * * *',
  everyDay: '0 0 * * *',
};

const { logInfo, logError } = logger('indexer');

const runServer = async () => {
  logInfo('Starting indexer server');
  const tasksRunning: Record<string, boolean> = {};

  function spawnTask(taskName: string, chains: string[]) {
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
    { name: 'prices', schedule: timers.every5mins },
    { name: 'validators', schedule: timers.everyHour },
    { name: 'validatorInfo', schedule: timers.everyDay },
    { name: 'chain-tvls', schedule: timers.everyHour },
    { name: 'chain-aprs', schedule: timers.everyHour },
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

  tasks.forEach((task) => {
    spawnTask(task.name, chains).catch((e) => logError(`Initial run error for task ${task.name}:`, e));
  });

  // Initial run for validatorInfo task after 5 minutes for wait validators updated
  setTimeout(
    () => {
      spawnTask('validatorInfo', chains).catch((e) => logError(`Initial run error for task validatorInfo:`, e));
    },
    5 * 60 * 1000,
  );
};

runServer();
