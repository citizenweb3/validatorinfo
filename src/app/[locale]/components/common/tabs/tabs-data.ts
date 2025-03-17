import { StaticImageData } from 'next/image';

import icons from '@/components/icons';

export interface TabOptions {
  name: string;
  href: string;
  icon?: StaticImageData;
  iconHovered?: StaticImageData;
  isScroll?: boolean;
}

export const mainTabs: TabOptions[] = [
  {
    name: 'Calculate',
    href: '/stakingcalculator',
    icon: icons.CalculatorIcon,
    iconHovered: icons.CalculatorIconHovered,
  },
  {
    name: 'Compare',
    href: '/comparevalidators',
    icon: icons.ComparisonIcon,
    iconHovered: icons.ComparisonIconHovered,
  },
  { name: 'ValidatorInfo', href: '/', icon: icons.ValidatorsIcon, iconHovered: icons.ValidatorsIconHovered },
  { name: 'Rumors', href: '/rumors', icon: icons.RumorsIcon, iconHovered: icons.RumorsIconHovered },
  { name: 'Global', href: '/global', icon: icons.GlobalIcon, iconHovered: icons.GlobalIconHovered },
];

export const validatorsTabs: TabOptions[] = [
  {
    name: 'Validators',
    href: '/validators',
    icon: icons.ValidatorsIcon,
    iconHovered: icons.ValidatorsIconHovered,
  },
  {
    name: 'Networks',
    href: '/networks',
    icon: icons.NetworksIcon,
    iconHovered: icons.NetworksIconHovered,
  },
  { name: 'Metrics', href: '/metrics', icon: icons.MetricsIcon, iconHovered: icons.MetricsIconHovered },
  { name: 'AI', href: '/ai', icon: icons.RabbitIcon, iconHovered: icons.RabbitIconHovered },
];

export const aboutTabs: TabOptions[] = [
  { name: 'Staking', href: '/about/staking', icon: icons.StakingIcon, iconHovered: icons.StakingIconHovered },
  { name: 'Partners', href: '/about/partners', icon: icons.PartnersIcon, iconHovered: icons.PartnersIconHovered },
  { name: 'General Info', href: '/about', icon: icons.GeneralIcon, iconHovered: icons.GeneralIconHovered },
  { name: 'Podcast', href: '/about/podcasts', icon: icons.PodcastIcon, iconHovered: icons.PodcastIconHovered },
  { name: 'Contacts', href: '/about/contacts', icon: icons.ContactsIcon, iconHovered: icons.ContactsIconHovered },
];

export const profileTabs: TabOptions[] = [
  { name: 'Tools', href: '/profile/tools' },
  { name: 'Rewards', href: '/profile/rewards' },
  { name: 'Dashboard', href: '/profile' },
  { name: 'Messages', href: '/profile/messages' },
  { name: 'Wallet', href: '/profile/wallet' },
];

export const getValidatorProfileTabs = (id: number): TabOptions[] => {
  return [
    {
      name: 'Revenue',
      href: `/validators/${id}/revenue`,
      icon: icons.RevenueIcon,
      iconHovered: icons.RevenueIconHovered,
    },
    {
      name: 'Metrics',
      href: `/validators/${id}/metrics`,
      icon: icons.MetricsIcon,
      iconHovered: icons.MetricsIconHovered,
    },
    {
      name: 'Network Table',
      href: `/validators/${id}/networks`,
      icon: icons.NetworkTableIcon,
      iconHovered: icons.NetworkTableIconHovered,
    },
    {
      name: 'Public Goods',
      href: `/validators/${id}/public_goods/tools`,
      icon: icons.PublicGoodsIcon,
      iconHovered: icons.PublicGoodsIconHovered,
    },
    {
      name: 'Governance',
      href: `/validators/${id}/governance`,
      icon: icons.GovernanceIcon,
      iconHovered: icons.GovernanceIconHovered,
    },
  ];
};

export const getValidatorPublicGoodTabs = (id: number): TabOptions[] => {
  return [
    {
      name: 'Infrastructure',
      href: `/validators/${id}/public_goods/infrastructure`,
    },
    {
      name: 'Community',
      href: `/validators/${id}/public_goods/community`,
    },
    {
      name: 'Media',
      href: `/validators/${id}/public_goods/media`,
    },
    {
      name: 'Tools',
      href: `/validators/${id}/public_goods/tools`,
    },
    {
      name: 'Others',
      href: `/validators/${id}/public_goods/others`,
    },
  ];
};

export const getNodeProfileTabs = (id: number, operatorAddress: string): TabOptions[] => {
  return [
    {
      name: 'TX Summary',
      href: `/validators/${id}/${operatorAddress}/tx_summary`,
      icon: icons.TxSummary,
      iconHovered: icons.TxSummaryHovered,
    },
    {
      name: 'Voting Summary',
      href: `/validators/${id}/${operatorAddress}/voting_summary`,
      icon: icons.VotingSummary,
      iconHovered: icons.VotingSummaryHovered,
    },
    {
      name: 'Validator Passport',
      href: `/validators/${id}/${operatorAddress}/validator_passport/authz/withdraw_rewards`,
      icon: icons.ValidatorPassport,
      iconHovered: icons.ValidatorPassportHovered,
    },
    {
      name: 'Rich List',
      href: `/validators/${id}/${operatorAddress}/rich_list`,
      icon: icons.RichList,
      iconHovered: icons.RichListHovered,
    },
    {
      name: 'Revenue',
      href: `/validators/${id}/${operatorAddress}/revenue`,
      icon: icons.RevenueIcon,
      iconHovered: icons.RevenueIconHovered,
    },
  ];
};

export const getPassportAuthzTabs = (id: number, operatorAddress: string): TabOptions[] => {
  return [
    {
      name: 'Withdraw Rewards',
      href: `/validators/${id}/${operatorAddress}/validator_passport/authz/withdraw_rewards`,
      isScroll: false,
    },
    {
      name: 'Unjail',
      href: `/validators/${id}/${operatorAddress}/validator_passport/authz/unjail`,
      isScroll: false,
    },
    {
      name: 'Transact',
      href: `/validators/${id}/${operatorAddress}/validator_passport/authz/transact`,
      isScroll: false,
    },
    {
      name: 'Vote',
      href: `/validators/${id}/${operatorAddress}/validator_passport/authz/vote`,
      isScroll: false,
    },
  ];
};

export const getNetworkProfileTabs = (id: number): TabOptions[] => {
  return [
    {
      name: 'Governance',
      href: `/networks/${id}/governance`,
      icon: icons.GovernanceIcon,
      iconHovered: icons.GovernanceIconHovered,
    },
    {
      name: 'Statistics',
      href: `/networks/${id}/statistics`,
      icon: icons.StatisticsIcon,
      iconHovered: icons.StatisticsIconHovered,
    },
    {
      name: 'Passport',
      href: `/networks/${id}/passport`,
      icon: icons.NetworkPassportIcon,
      iconHovered: icons.NetworkPassportIconHovered,
    },
    {
      name: 'Dev Info',
      href: `/networks/${id}/dev_info`,
      icon: icons.DevInfoIcon,
      iconHovered: icons.DevInfoIconHovered,
    },
    {
      name: 'Tokenomics',
      href: `/networks/${id}/tokenomics`,
      icon: icons.TokenomicsIcon,
      iconHovered: icons.TokenomicsIconHovered,
    },
  ];
};

export const getTxInformationTabs = (id: number, txHash: string): TabOptions[] => {
  return [
    {
      name: 'Expand',
      href: `/networks/${id}/tx/${txHash}/expand`,
    },
    {
      name: 'JSON',
      href: `/networks/${id}/tx/${txHash}/json`,
    },
  ];
};
