export interface ValidatorLinks {
  website?: string;
  github?: string;
  x?: string;
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
