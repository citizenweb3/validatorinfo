import { NodeResult } from '@/server/types';

export type ChainNodeType = 'indexer' | 'lcd' | 'rpc' | 'grpc' | 'ws';

export interface MainParams {
  unbondingTime: number | null;
}

export interface ChainTVLResult {
  totalSupply: string;
  bondedTokens: string;
  unbondedTokens: string;
  unbondedTokensRatio: number;
  tvl: number;
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

export type GetTvlFunction = (chain: AddChainProps) => Promise<ChainTVLResult | null>;
export type GetAprFunction = (chain: AddChainProps) => Promise<number>;
export type GetNodesFunction = (chain: AddChainProps) => Promise<NodeResult[]>;
export type GetMainParamsFunction = (chain: AddChainProps) => Promise<MainParams>;

export interface ChainMethods {
  getNodes: GetNodesFunction;
  getApr: GetAprFunction;
  getTvl: GetTvlFunction;
  getMainParams: GetMainParamsFunction;
}
