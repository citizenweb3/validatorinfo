export interface ValidatorChain {
  id: number;
  name: string;
  icon: string;
}

export interface ValidatorLinks {
  website?: string;
  github?: string;
  x?: string;
}

export interface ValidatorItem {
  operatorAddress: string;
  moniker: string;
  identity: string;
  chainIds: string[];
  chainNames: string[];
  chainPrettyNames: string[];
  chainLogoUrls: string[];
  chainTypes: string[];
  logoUrl: string | null;
  tvs: number[];
  links?: ValidatorLinks;
}

// export interface ValidatorItem {
//   id: number;
//   icon?: string;
//   name: string;
//   isFavorite?: boolean;
//   ecosystems: string[];
//   links: ValidatorLinks;
//   battery?: number;
//   scores: { technical?: number; social?: number; governance?: number; user?: number };
//   tvs: {
//     number: number;
//   };
//   chains: ValidatorChain[];
// }

export interface Chain {
  type: string;
  chainId: string;
  name: string;
  prettyName: string;
  coinType: number;
  denom: string;
  minimalDenom: string;
  coinDecimals: number;
  logoUrl: string;
  coinGeckoId: string;
  bech32Prefix: string;
  twitterUrl: string;
  docs: string | null;
  github: {
    chainId: string;
    url: string;
    mainRepo: string;
  } | null;
  apr: any[];
  priceChart: {
    chainId: string;
    id: number;
    value: number;
    date: Date;
  }[];
}

export interface ChainItem {
  id: number;
  name: string;
  asset: {
    name: string;
    price: number;
    symbol: string;
    isSymbolFirst: boolean;
  };
}

export interface StakingRates {
  d1: number;
  d7: number;
  d30: number;
  d365: number;
}
