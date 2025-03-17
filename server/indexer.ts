import { CronJob } from 'cron';
import express, { Express } from 'express';

import db from '@/db';
import logger from '@/logger';
import getChainApr from '@/server/jobs/apr/get-chain-apr';
import getChainUptime from '@/server/jobs/get-chain-uptime';
import { getChainTVL } from '@/server/jobs/tvl/get-chain-tvl';
import updateValidatorsByKeybase from '@/server/jobs/update-validators-by-keybase';
import updateValidatorsBySite from '@/server/jobs/update-validators-by-site';

import getNodes from './jobs/get-nodes';
import { getPrices } from './jobs/get-prices';
import { ChainWithNodes } from './types';

const timers = {
  every5mins: '*/5 * * * *',
  everyHour: '0 * * * *',
};

const { logInfo, logError } = logger('indexer');

const runServer = async () => {
  const app: Express = express();
  const port = process.env.INDEXER_PORT ?? 3333;

  const chains: ChainWithNodes[] = await db.chain.findMany({
    where: { name: 'nomic' },
    include: { chainNodes: true },
    orderBy: { name: 'asc' },
  });

  app.listen(port, () => {
    logInfo(`Indexer is running at http://localhost:${port}`);
  });

  await getChainApr(chains);
  await getChainUptime(chains);
  await getChainTVL(chains);
  await getPrices(chains);
  await getNodes(chains);
  await updateValidatorsByKeybase();
  await updateValidatorsBySite();

  const getPricesJob = new CronJob(
    timers.every5mins,
    async () => {
      logInfo('prices parsing');
      await getPrices(chains);
      logInfo('prices parsed');
    },
    null,
    true,
  );
  const getValidatorsJob = new CronJob(
    timers.everyHour,
    async () => {
      logInfo('validators parsing');
      await getNodes(chains);
      logInfo('validators parsed');
    },
    null,
    true,
  );
  const getValidatorLogosJob = new CronJob(
    timers.every5mins,
    async () => {
      logInfo('validator info parsing');
      await updateValidatorsByKeybase();
      await updateValidatorsBySite();
      logInfo('validator info parsed');
    },
    null,
    true,
  );
  const getTVLsJob = new CronJob(
    timers.every5mins,
    async () => {
      logInfo('validator info parsing');
      await getChainUptime(chains);
      await getChainTVL(chains);
      logInfo('validator info parsed');
    },
    null,
    true,
  );
  const getAPRsJob = new CronJob(
    timers.every5mins,
    async () => {
      logInfo('apr info parsing');
      await getChainApr(chains);
      logInfo('apr info parsed');
    },
    null,
    true,
  );

  getPricesJob.start();
  getValidatorsJob.start();
  getValidatorLogosJob.start();
  getTVLsJob.start();
  getAPRsJob.start();
};

runServer();
