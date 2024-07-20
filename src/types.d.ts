export interface ValidatorChain {
  id: number;
  name: string;
  icon: string;
}

export interface ValidatorLinks {
  github?: string;
  x?: string;
}

export interface ValidatorItem {
  id: number;
  icon?: string;
  name: string;
  isFavorite?: boolean;
  ecosystems: string[];
  links: ValidatorLinks;
  battery?: number;
  scores: { technical?: number; social?: number; governance?: number; user?: number };
  tvs: {
    number: number;
  };
  chains: ValidatorChain[];
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
