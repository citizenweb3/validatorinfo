import { parentPort, workerData } from 'worker_threads';

import logger from '@/logger';
import getChainUptime from '@/server/jobs/get-chain-uptime';
import getNodes from '@/server/jobs/get-nodes';
import { getPrices } from '@/server/jobs/get-prices';
import { getTokenomics } from '@/server/jobs/get-tokenomics';
import updateActiveSetMinAmount from '@/server/jobs/update-active-set-min-amount';
import updateChainApr from '@/server/jobs/update-chain-apr';
import updateChainNodeParams from '@/server/jobs/update-chain-node-params';
import updateChainProposals from '@/server/jobs/update-chain-proposals';
import updateChainRewards from '@/server/jobs/update-chain-rewards';
import updateChainSlashingParams from '@/server/jobs/update-chain-slashing-params';
import updateChainStakingParams from '@/server/jobs/update-chain-staking-params';
import { updateChainTvs } from '@/server/jobs/update-chain-tvs';
import updateCirculatingTokensOnchain from '@/server/jobs/update-circulating-tokens-onchain';
import updateCirculatingTokensPublic from '@/server/jobs/update-circulating-tokens-public';
import updateCommPool from '@/server/jobs/update-community-pool';
import updateCommTax from '@/server/jobs/update-community-tax';
import updateDelegatorsAmount from '@/server/jobs/update-delegators-amount';
import updateFdv from '@/server/jobs/update-fdv';
import updateInflationRate from '@/server/jobs/update-inflation-rate';
import updateNodesRewards from '@/server/jobs/update-nodes-rewards';
import updateNodesVotes from '@/server/jobs/update-nodes-votes';
import updateProposalParams from '@/server/jobs/update-proposal-params';
import updateSlashingInfos from '@/server/jobs/update-slashing-infos';
import updateSlashingInfosNamada from '@/server/jobs/update-slashing-infos-namada';
import updateSlashingInfosSolana from '@/server/jobs/update-slashing-infos-solana';
import updateStakingPageJson from '@/server/jobs/update-staking-page-json';
import updateValidatorsByKeybase from '@/server/jobs/update-validators-by-keybase';
import updateValidatorsBySite from '@/server/jobs/update-validators-by-site';
import updateWalletsAmount from '@/server/jobs/update-wallets-amount';

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
      case 'chain-slashing-params':
        await updateChainSlashingParams(chains);
        break;
      case 'slashing-infos':
        await updateSlashingInfos(chains);
        break;
      case 'slashing-infos-namada':
        await updateSlashingInfosNamada(chains);
        break;
      case 'slashing-infos-solana':
        await updateSlashingInfosSolana(chains);
        break;
      case 'chain-node-params':
        await updateChainNodeParams(chains);
        break;
      case 'chain-proposals':
        await updateChainProposals(chains);
        break;
      case 'update-nodes-votes':
        await updateNodesVotes(chains);
        break;
      case 'community-tax':
        await updateCommTax(chains);
        break;
      case 'wallets-amount':
        await updateWalletsAmount(chains);
        break;
      case 'tokenomics':
        await getTokenomics();
        break;
      case 'proposal-params':
        await updateProposalParams(chains);
        break;
      case 'update-staking-page-json':
        await updateStakingPageJson();
        break;
      case 'update-nodes-rewards':
        await updateNodesRewards(chains);
        break;
      case 'update-chain-rewards':
        await updateChainRewards(chains);
        break;
      case 'community-pool':
        await updateCommPool(chains);
        break;
      case 'active-set-min-amount':
        await updateActiveSetMinAmount(chains);
        break;
      case 'inflation-rate':
        await updateInflationRate(chains);
        break;
      case 'circulating-tokens-onchain':
        await updateCirculatingTokensOnchain(chains);
        break;
      case 'circulating-tokens-public':
        await updateCirculatingTokensPublic(chains);
        break;
      case 'update-fdv':
        await updateFdv(chains);
        break;
      case 'update-delegators-amount':
        await updateDelegatorsAmount(chains);
        break;
      default:
        throw new Error(`Unknown task: ${taskName}`);
    }
    logInfo(`${taskName} completed successfully`);
    parentPort?.postMessage(`${taskName} completed successfully`);
    process.exit(0);
  } catch (err) {
    logError(`${taskName} failed`, err);
    process.exit(2);
  }
}

runTask();
