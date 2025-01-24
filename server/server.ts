import { CronJob } from 'cron';
import express, { Express } from 'express';

import db from '@/db';

import createUpdateValidatorsLogos from './jobs/create-update-validators-logos';
import getNodes from './jobs/get-nodes';
import { getPrices } from './jobs/get-prices';

const runServer = async () => {
  const app: Express = express();
  const port = process.env.INDEXER_PORT ?? 3333;

  const chains = await db.chain.findMany({
    include: { grpcNodes: true, lcdNodes: true, rpcNodes: true, wsNodes: true },
    orderBy: { name: 'asc' },
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
  await getPrices(chains);
  await getNodes(chains);
  await createUpdateValidatorsLogos();

  const getPricesJob = new CronJob(
    '* 5 * * * *',
    async () => {
      await getPrices(chains);
      console.log('prices parsed');
    },
    null,
    true,
  );
  const getValidatorsJob = new CronJob(
    '* * 1 * * *',
    async () => {
      await getNodes(chains);
      console.log('validators parsed');
    },
    null,
    true,
  );
  const getValidatorLogosJob = new CronJob(
    '* 5 * * * *',
    async () => {
      await createUpdateValidatorsLogos();
      console.log('validators parsed');
    },
    null,
    true,
  );

  getPricesJob.start();
  getValidatorsJob.start();
  getValidatorLogosJob.start();
};

runServer();
