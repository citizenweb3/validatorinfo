import { PrismaClient } from '@prisma/client';
import { CronJob } from 'cron';
import express, { Express } from 'express';



import { getNodes } from './jobs/getNodes';
import { getPrices } from './jobs/getPrices';
import { getValidatorsLogos } from './jobs/getValidators';


const getData = async (lcd: string, path: string) => await fetch(lcd + path).then((data) => data.json());

const runServer = async () => {
  const app: Express = express();
  const port = process.env.INDEXER_PORT ?? 3333;

  const client = new PrismaClient();
  const chains = await client.chain.findMany({
    include: { grpcNodes: true, lcdNodes: true, rpcNodes: true, wsNodes: true },
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
  await getPrices(client, chains);
  await getNodes(client, chains);
  await getValidatorsLogos(client);

  const getPricesJob = new CronJob(
    '* 5 * * * *', // cronTime
    async () => {
      await getPrices(client, chains);
      console.log('prices parsed');
    }, // onTick
    null, // onComplete
    true, // start
  );
  getPricesJob.start();
  const getValidatorsJob = new CronJob(
    '* 5 * * * *', // cronTime
    async () => {
      await getNodes(client, chains);
      console.log('validators parsed');
    }, // onTick
    null, // onComplete
    true, // start
  );
  getValidatorsJob.start();
};

runServer();