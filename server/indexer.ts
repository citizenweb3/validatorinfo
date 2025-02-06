import { CronJob } from 'cron';
import express, { Express } from 'express';

import db from '@/db';
import logger from '@/logger';

import createUpdateValidatorsLogos from './jobs/create-update-validators-logos';
import getNodes from './jobs/get-nodes';
import { getPrices } from './jobs/get-prices';
import { ChainWithNodes } from './types';

const { logInfo, logError } = logger('indexer');

const runServer = async () => {
  const app: Express = express();
  const port = process.env.INDEXER_PORT ?? 3333;

  const chains: ChainWithNodes[] = await db.chain.findMany({
    include: { chainNodes: true },
    orderBy: { name: 'asc' },
  });

  app.listen(port, () => {
    logInfo(`Indexer is running at http://localhost:${port}`);
  });
  await getPrices(chains);
  await getNodes(chains);
  await createUpdateValidatorsLogos();

  const getPricesJob = new CronJob(
    '* 5 * * * *',
    async () => {
      logInfo('prices parsing');
      await getPrices(chains);
      logInfo('prices parsed');
    },
    null,
    true,
  );
  const getValidatorsJob = new CronJob(
    '* * 1 * * *',
    async () => {
      logInfo('validators parsing');
      await getNodes(chains);
      logInfo('validators parsed');
    },
    null,
    true,
  );
  const getValidatorLogosJob = new CronJob(
    '* 5 * * * *',
    async () => {
      logInfo('validator logos parsing');
      await createUpdateValidatorsLogos();
      logInfo('validator logos parsed');
    },
    null,
    true,
  );

  getPricesJob.start();
  getValidatorsJob.start();
  getValidatorLogosJob.start();
};

runServer();
