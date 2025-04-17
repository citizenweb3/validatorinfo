import { NodeResult } from '@/server/types';

import { Prisma } from '.prisma/client';

import ProposalCreateInput = Prisma.ProposalCreateInput;

export type ChainNodeType = 'indexer' | 'lcd' | 'rpc' | 'grpc' | 'ws';

export interface StakingParams {
  unbondingTime: number | null;
  maxValidators: number | null;
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
  denom: string;
  minimalDenom: string;
  logoUrl: string;
  coinGeckoId: string;
  bech32Prefix: string;
  nodes: { type: ChainNodeType; url: string }[];
  coinDecimals: number;
  coinType: number;
  twitterUrl: string;
  docs: string | null;
  mainRepo: string;
  githubUrl: string;
  hasValidators?: boolean;
}

export type ResultProposalItem = Omit<ProposalCreateInput, 'chain'>;

export type ProposalsResult = {
  proposals: ResultProposalItem[];
  total: number;
  live: number;
  passed: number;
};

export type GetTvsFunction = (chain: AddChainProps) => Promise<ChainTVSResult | null>;
export type GetAprFunction = (chain: AddChainProps) => Promise<number>;
export type GetNodesFunction = (chain: AddChainProps) => Promise<NodeResult[]>;
export type GetProposalsFunction = (chain: AddChainProps) => Promise<ProposalsResult>;
export type GetStakingParamsFunction = (chain: AddChainProps) => Promise<StakingParams>;

export interface ChainMethods {
  getNodes: GetNodesFunction;
  getApr: GetAprFunction;
  getTvs: GetTvsFunction;
  getStakingParams: GetStakingParamsFunction;
  getProposals: GetProposalsFunction;
}
