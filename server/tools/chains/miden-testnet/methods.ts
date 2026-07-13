import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import getAvgFee from '@/server/tools/chains/miden-testnet/get-avg-fee';
import getChainUptime from '@/server/tools/chains/miden-testnet/get-chain-uptime';
import getTotalTxs from '@/server/tools/chains/miden-testnet/get-total-txs';
import getTps from '@/server/tools/chains/miden-testnet/get-tps';
import getTxsLast24h from '@/server/tools/chains/miden-testnet/get-txs-last-24h';

// Miden — STARK-based zkVM rollup with client-side proving. Testnet has a
// centralized block producer (single validator_key per header), no PoS and
// no validators-as-stakers ⇒ hasValidators: false in params.ts skips
// validator-centric jobs. Tx metrics are wired via the citizenweb3 indexer's
// /transactions endpoints and stats.tps; avgFee stays null until the indexer
// surfaces per-tx fees. See docs/plans/2026-05-19-miden-testnet-stage3-tx-integration.md
const chainMethods: ChainMethods = {
  getNodes: async () => [],
  getApr: async () => null,
  getTvs: async () => null,
  getStakingParams: async () => ({ unbondingTime: null, maxValidators: null }),
  getNodeParams: async () => ({
    peers: null,
    seeds: null,
    daemonName: null,
    nodeHome: null,
    keyAlgos: null,
    binaries: null,
    genesis: null,
  }),
  getProposals: async () => ({ proposals: [], total: 0, live: 0, passed: 0 }),
  getSlashingParams: async () => ({ blocksWindow: null, jailedDuration: null }),
  getMissedBlocks: async () => [],
  getNodesVotes: async () => [],
  getNodeAuthzGrants: async () => null,
  getCommTax: async () => null,
  getWalletsAmount: async () => null,
  getProposalParams: async () => ({
    creationCost: null,
    votingPeriod: null,
    participationRate: null,
    quorumThreshold: null,
  }),
  getNodeRewards: async () => [],
  getNodeCommissions: async () => [],
  getCommunityPool: async () => null,
  getActiveSetMinAmount: async () => null,
  getInflationRate: async () => null,
  getCirculatingTokensOnchain: async () => null,
  getCirculatingTokensPublic: async () => null,
  getDelegatorsAmount: async () => [],
  getUnbondingTokens: async () => null,
  getChainUptime,
  getRewardAddress: async () => [],
  getTotalTxs,
  getTxsLast24h,
  getTps,
  getAvgFee,
};

export default chainMethods;
