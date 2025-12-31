import { parentPort, workerData } from 'worker_threads';

import logger from '@/logger';
import checkNodesHealth from '@/server/jobs/check-nodes-health';
import getChainUptime from '@/server/jobs/get-chain-uptime';
import { getCoingeckoData } from '@/server/jobs/get-coingecko-data';
import getNodes from '@/server/jobs/get-nodes';
import { getPrices } from '@/server/jobs/get-prices';
import matchChainNodes from '@/server/jobs/match-chain-nodes';
import syncAztecCommittee from '@/server/jobs/sync-aztec-committee';
import syncAztecEvents from '@/server/jobs/sync-aztec-events';
import updateActiveSetMinAmount from '@/server/jobs/update-active-set-min-amount';
import updateAverageDelegation from '@/server/jobs/update-average-delegation';
import updateAztecCoinbaseAddress from '@/server/jobs/update-aztec-coinbase-address';
import updateAztecSequencerStake from '@/server/jobs/update-aztec-sequencer-stake';
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
import updateGithubRepositories from '@/server/jobs/update-github-repositories';
import updateInflationRate from '@/server/jobs/update-inflation-rate';
import updateNodesCommissions from '@/server/jobs/update-nodes-commissions';
import updateNodesRewards from '@/server/jobs/update-nodes-rewards';
import updateNodesVotes from '@/server/jobs/update-nodes-votes';
import updateProposalParams from '@/server/jobs/update-proposal-params';
import updateRewardAddress from '@/server/jobs/update-reward-address';
import updateSlashingInfos from '@/server/jobs/update-slashing-infos';
import updateStakingPageJson from '@/server/jobs/update-staking-page-json';
import updateTwitterFollowersAmount from '@/server/jobs/update-twitter-followers-amount';
import updateUnbondingTokens from '@/server/jobs/update-unbonding-tokens';
import updateValidatorsAztecLogos from '@/server/jobs/update-validators-aztec-logos';
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
      case 'coingecko-data':
        await getCoingeckoData();
        break;
      case 'proposal-params':
        await updateProposalParams(chains);
        break;
      case 'update-staking-page-json':
        await updateStakingPageJson();
        break;
      case 'update-chain-rewards':
        await updateChainRewards(chains);
        break;
      case 'update-nodes-rewards':
        await updateNodesRewards(chains);
        break;
      case 'update-nodes-commissions':
        await updateNodesCommissions(chains);
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
      case 'unbonding-tokens':
        await updateUnbondingTokens(chains);
        break;
      case 'update-fdv':
        await updateFdv(chains);
        break;
      case 'update-delegators-amount':
        await updateDelegatorsAmount(chains);
        break;
      case 'update-average-delegation':
        await updateAverageDelegation(chains);
        break;
      case 'github-repositories':
        await updateGithubRepositories(chains);
        break;
      case 'match-chain-nodes':
        await matchChainNodes();
        break;
      case 'check-nodes-health':
        await checkNodesHealth();
        break;
      case 'update-twitter-followers-amount':
        await updateTwitterFollowersAmount(chains);
        break;
      case 'sync-aztec-events':
        await syncAztecEvents();
        break;
      case 'update-reward-address':
        await updateRewardAddress(chains);
        break;
      case 'update-aztec-sequencer-stake':
        await updateAztecSequencerStake(chains);
        break;
      case 'update-aztec-coinbase-address':
        await updateAztecCoinbaseAddress();
        break;
      case 'update-validators-aztec-logos':
        await updateValidatorsAztecLogos();
        break;
      case 'sync-aztec-committee':
        await syncAztecCommittee();
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
