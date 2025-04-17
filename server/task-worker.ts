import { parentPort, workerData } from 'worker_threads';

import logger from '@/logger';
import getChainUptime from '@/server/jobs/get-chain-uptime';
import getNodes from '@/server/jobs/get-nodes';
import { getPrices } from '@/server/jobs/get-prices';
import updateChainApr from '@/server/jobs/update-chain-apr';
import updateChainProposals from '@/server/jobs/update-chain-proposals';
import updateChainStakingParams from '@/server/jobs/update-chain-staking-params';
import { updateChainTvs } from '@/server/jobs/update-chain-tvs';
import updateValidatorsByKeybase from '@/server/jobs/update-validators-by-keybase';
import updateValidatorsBySite from '@/server/jobs/update-validators-by-site';

const { taskName, chains } = workerData;
const { logInfo, logError } = logger(taskName);

async function runTask() {
  logInfo(`Running task ${taskName}`);
  try {
    switch (taskName) {
      case 'prices':
        await getPrices();
        break;
      case 'validators':
        await getNodes(chains);
        break;
      case 'validatorInfo':
        await updateValidatorsByKeybase();
        await updateValidatorsBySite();
        break;
      case 'chain-tvls':
        await getChainUptime(chains);
        await updateChainTvs(chains);
        break;
      case 'chain-aprs':
        await updateChainApr(chains);
        break;
      case 'chain-staking-params':
        await updateChainStakingParams(chains);
        break;
      case 'chain-proposals':
        await updateChainProposals(chains);
        break;
      default:
        throw new Error(`Unknown task: ${taskName}`);
    }
    logInfo(`${taskName} completed successfully`);
    parentPort?.postMessage(`${taskName} completed successfully`);
  } catch (err) {
    logError(`${taskName} failed`, err);
    process.exit(2);
  }
}

runTask();
