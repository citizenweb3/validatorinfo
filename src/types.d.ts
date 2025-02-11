export interface ValidatorLinks {
  website?: string;
  github?: string;
  twitter?: string;
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

interface ChatMessage {
  name: string;
  text: string;
  date: Date;
}

export interface PagesProps {
  page:
    | 'HomePage'
    | 'AboutPage'
    | 'ProfilePage'
    | 'ValidatorsPage'
    | 'ValidatorProfileHeader'
    | 'ValidatorNetworksPage'
    | 'ValidatorGovernancePage'
    | 'ValidatorPublicGoodsPage'
    | 'PublicGoodsInfrastructurePage'
    | 'PublicGoodsMediaPage'
    | 'NodeProfileHeader'
    | 'ValidatorPassportPage'
    | 'VotingSummaryPage'
    | 'TxSummaryPage'
    | 'RichListPage'
    | 'NodeRevenuePage';
}
