import { CronJob } from 'cron';
import express, { Express } from 'express';

import db from '@/db';

import getNodes from './jobs/get-nodes';
import { getPrices } from './jobs/getPrices';
import { getValidatorsLogos } from './jobs/getValidators';

const runServer = async () => {
  const app: Express = express();
  const port = process.env.INDEXER_PORT ?? 3333;

  const chains = await db.chain.findMany({
    include: { grpcNodes: true, lcdNodes: true, rpcNodes: true, wsNodes: true },
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
  await getPrices(db, chains);
  await getNodes(db, chains);
  await getValidatorsLogos(db);

  const getPricesJob = new CronJob(
    '* 5 * * * *', // cronTime
    async () => {
      await getPrices(db, chains);
      console.log('prices parsed');
    }, // onTick
    null, // onComplete
    true, // start
  );
  getPricesJob.start();
  const getValidatorsJob = new CronJob(
    '* 5 * * * *', // cronTime
    async () => {
      await getNodes(db, chains);
      console.log('validators parsed');
    }, // onTick
    null, // onComplete
    true, // start
  );
  getValidatorsJob.start();
};

runServer();
