import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getActiveSetMinAmount from '@/server/tools/chains/cosmoshub/get-active-set-min-amount';
import getApr from '@/server/tools/chains/cosmoshub/get-apr';
import getAvgFee from '@/server/tools/chains/cosmoshub/get-avg-fee';
import getCirculatingTokensOnchain from '@/server/tools/chains/cosmoshub/get-circulating-tokens-onchain';
import getCirculatingTokensPublic from '@/server/tools/chains/cosmoshub/get-circulating-tokens-public';
import getCommunityPool from '@/server/tools/chains/cosmoshub/get-community-pool';
import getCommTax from '@/server/tools/chains/cosmoshub/get-community-tax';
import getDelegatorsAmount from '@/server/tools/chains/cosmoshub/get-delegators-amount';
import getInflationRate from '@/server/tools/chains/cosmoshub/get-inflation-rate';
import getMissedBlocks from '@/server/tools/chains/cosmoshub/get-missed-blocks';
import getNodeCommissions from '@/server/tools/chains/cosmoshub/get-node-commissions';
import getNodeParams from '@/server/tools/chains/cosmoshub/get-node-params';
import getNodeRewards from '@/server/tools/chains/cosmoshub/get-node-rewards';
import getNodes from '@/server/tools/chains/cosmoshub/get-nodes';
import getNodesVotes from '@/server/tools/chains/cosmoshub/get-nodes-votes';
import getProposalParams from '@/server/tools/chains/cosmoshub/get-proposal-params';
import getProposals from '@/server/tools/chains/cosmoshub/get-proposals';
import getSlashingParams from '@/server/tools/chains/cosmoshub/get-slashing-params';
import getStakingParams from '@/server/tools/chains/cosmoshub/get-staking-params';
import getTotalTxs from '@/server/tools/chains/cosmoshub/get-total-txs';
import getTps from '@/server/tools/chains/cosmoshub/get-tps';
import getTvs from '@/server/tools/chains/cosmoshub/get-tvs';
import getTxsLast24h from '@/server/tools/chains/cosmoshub/get-txs-last-24h';
import getUnbondingTokens from '@/server/tools/chains/cosmoshub/get-unbonding-tokens';
import getWalletsAmount from '@/server/tools/chains/cosmoshub/get-wallets-amount';
import getChainUptime from '@/server/tools/chains/cosmoshub/get-chain-uptime';
import getRewardAddress from '@/server/tools/chains/cosmoshub/get-reward-address';
import nullTxMetrics from '@/server/tools/chains/null-tx-metrics';

const chainMethods: ChainMethods = {
  ...nullTxMetrics,
  getNodes,
  getApr,
  getTvs,
  getStakingParams,
  getNodeParams,
  getProposals,
  getSlashingParams,
  getMissedBlocks,
  getNodesVotes,
  getCommTax,
  getWalletsAmount,
  getProposalParams,
  getNodeRewards,
  getNodeCommissions,
  getCommunityPool,
  getActiveSetMinAmount,
  getInflationRate,
  getCirculatingTokensOnchain,
  getCirculatingTokensPublic,
  getDelegatorsAmount,
  getUnbondingTokens,
  getChainUptime,
  getRewardAddress,
  getTotalTxs,
  getTxsLast24h,
  getTps,
  getAvgFee,
};

export default chainMethods;
