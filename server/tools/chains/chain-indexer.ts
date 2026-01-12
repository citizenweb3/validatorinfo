import { NodeResult, SlashingSigningInfos } from '@/server/types';
import { ChainWithParams } from '@/services/chain-service';

import { Prisma } from '.prisma/client';

import ProposalCreateInput = Prisma.ProposalCreateInput;
import { Chain } from '@prisma/client';

export type ChainNodeType = 'indexer' | 'rest' | 'rpc' | 'grpc' | 'ws' | 'exit' | 'entry';

export interface StakingParams {
  unbondingTime: number | null;
  maxValidators: number | null;
}

export interface SlashingChainParams {
  blocksWindow: number | null;
  jailedDuration: string | null;
}

export interface NodeParams {
  peers: string | null;
  seeds: string | null;
  daemonName: string | null;
  nodeHome: string | null;
  keyAlgos: string | null;
  binaries: string | null;
  genesis: string | null;
}

export interface GovParams {
  proposalDeposit: string | null;
  votingPeriod: number | null;
  minDeposit: string | null;
  quorum: number | null;
  threshold: number | null;
}

export interface ChainTVSResult {
  totalSupply: string;
  bondedTokens: string;
  unbondedTokens: string;
  unbondedTokensRatio: number;
  tvs: number;
}

export interface AddChainProps {
  ecosystem?: string;
  rang: number;
  chainId: string;
  name: string;
  prettyName: string;
  shortDescription?: string;
  denom: string;
  minimalDenom: string;
  logoUrl: string;
  coinGeckoId: string;
  bech32Prefix: string;
  nodes: { type: ChainNodeType; url: string; provider?: string }[];
  coinDecimals: number;
  coinType: number;
  twitterUrl: string;
  docs: string | null;
  mainRepo: string;
  githubUrl: string;
  hasValidators?: boolean;
  genesis?: string;
  chainRegistry?: string;
  peers?: string[];
  seeds?: string[];
  tags?: string[];
}

export type ResultProposalItem = Omit<ProposalCreateInput, 'chain'>;

export type ProposalsResult = {
  proposals: ResultProposalItem[];
  total: number;
  live: number;
  passed: number;
};

export interface NodeVote {
  address: string;
  proposalId: string;
  vote: string;
}

export interface AztecGovernanceConfigAdditional {
  votingDelay: string;
  executionDelay: string;
  gracePeriod: string;
  requiredYeaMargin: number;
  minimumVotes: string;
  lockDelay: string;
  [key: string]: string | number;
}

export interface ProposalParams {
  creationCost: number | null;
  votingPeriod: string | null;
  participationRate: number | null;
  quorumThreshold: number | null;
  aztecGovernanceConfigAdditional?: AztecGovernanceConfigAdditional | null;
}

export interface NodesRewards {
  address: string | null;
  rewards: string | null;
}

export interface NodesCommissions {
  address: string | null;
  commission: string | null;
}

export interface DelegatorsAmount {
  address: string;
  amount: number;
}

export interface ChainUptime {
  lastUptimeUpdated: Date;
  uptimeHeight: number;
  avgTxInterval: number;
}

export interface RewardAddress {
  operatorAddress: string;
  rewardAddresses: string;
}

export type GetTvsFunction = (chain: AddChainProps) => Promise<ChainTVSResult | null>;
export type GetAprFunction = (chain: AddChainProps) => Promise<number>;
export type GetNodesFunction = (chain: AddChainProps) => Promise<NodeResult[]>;
export type GetProposalsFunction = (chain: AddChainProps) => Promise<ProposalsResult>;
export type GetStakingParamsFunction = (chain: AddChainProps) => Promise<StakingParams>;
export type GetSlashingParamsFunction = (chain: AddChainProps) => Promise<SlashingChainParams>;
export type GetNodeParamsFunction = (chain: AddChainProps) => Promise<NodeParams>;
export type GetGovParamsFunction = (chain: AddChainProps) => Promise<GovParams>;
export type GetMissedBlocks = (chain: AddChainProps, dbChain: ChainWithParams) => Promise<SlashingSigningInfos[]>;
export type GetNodesVotes = (chain: AddChainProps, address: string) => Promise<NodeVote[]>;
export type GetCommTaxFunction = (chain: AddChainProps) => Promise<number | null>;
export type GetWalletsAmount = (chain: AddChainProps) => Promise<number | null>;
export type GetProposalParams = (chain: AddChainProps) => Promise<ProposalParams>;
export type GetNodeRewards = (chain: AddChainProps) => Promise<NodesRewards[]>;
export type GetNodeCommissions = (chain: AddChainProps) => Promise<NodesCommissions[]>;
export type GetCommPoolFunction = (chain: AddChainProps) => Promise<string | null>;
export type GetInflationRate = (chain: AddChainProps) => Promise<number | null>;
export type GetActiveSetMinAmount = (chain: AddChainProps) => Promise<string | null>;
export type GetCirculatingTokensOnchain = (
  chain: AddChainProps,
  totalSupply?: string,
  communityPool?: string,
) => Promise<string | null>;
export type GetCirculatingTokensPublic = (chain: AddChainProps) => Promise<string | null>;
export type GetDelegatorsAmount = (chain: AddChainProps) => Promise<DelegatorsAmount[]>;
export type GetUnbondingTokens = (chain: AddChainProps) => Promise<string | null>;
export type GetChainUptime = (dbChain: Chain) => Promise<ChainUptime | null>;
export type GetRewardAddress = (chain: AddChainProps, dbChainId: number) => Promise<RewardAddress[]>;

export interface ChainMethods {
  getNodes: GetNodesFunction;
  getApr: GetAprFunction;
  getTvs: GetTvsFunction;
  getStakingParams: GetStakingParamsFunction;
  getNodeParams: GetNodeParamsFunction;
  getProposals: GetProposalsFunction;
  getSlashingParams: GetSlashingParamsFunction;
  getMissedBlocks: GetMissedBlocks;
  getNodesVotes: GetNodesVotes;
  getCommTax: GetCommTaxFunction;
  getWalletsAmount: GetWalletsAmount;
  getProposalParams: GetProposalParams;
  getNodeRewards: GetNodeRewards;
  getNodeCommissions: GetNodeCommissions;
  getCommunityPool: GetCommPoolFunction;
  getActiveSetMinAmount: GetActiveSetMinAmount;
  getInflationRate: GetInflationRate;
  getCirculatingTokensOnchain: GetCirculatingTokensOnchain;
  getCirculatingTokensPublic: GetCirculatingTokensPublic;
  getDelegatorsAmount: GetDelegatorsAmount;
  getUnbondingTokens: GetUnbondingTokens;
  getChainUptime: GetChainUptime;
  getRewardAddress: GetRewardAddress;
}
