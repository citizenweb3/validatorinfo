import { StaticImageData } from 'next/image';

import icons from '@/components/icons';

export interface TabOptions {
  name: string;
  href: string;
  icon?: StaticImageData;
  iconHovered?: StaticImageData;
}

export const mainTabs: TabOptions[] = [
  {
    name: 'Calculate',
    href: '/staking_calculator',
    icon: icons.CalculatorIcon,
    iconHovered: icons.CalculatorIconHovered,
  },
  {
    name: 'Compare',
    href: '/validator_comparison',
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

export const getValidatorProfileTabs = (identity: string): TabOptions[] => {
  return [
    {
      name: 'Revenue',
      href: `/validators/${identity}/revenue`,
      icon: icons.RevenueIcon,
      iconHovered: icons.RevenueIconHovered
    },
    {
      name: 'Metrics',
      href: `/validators/${identity}/metrics`,
      icon: icons.MetricsIcon,
      iconHovered: icons.MetricsIconHovered
    },
    {
      name: 'Network Table',
      href: `/validators/${identity}/networks`,
      icon: icons.NetworkTableIcon,
      iconHovered: icons.NetworkTableIconHovered
    },
    {
      name: 'Public Goods',
      href: `/validators/${identity}/public_goods/tools`,
      icon: icons.PublicGoodsIcon,
      iconHovered: icons.PublicGoodsIconHovered
    },
    { name: 'Governance',
      href: `/validators/${identity}/governance`,
      icon: icons.GovernanceIcon,
      iconHovered: icons.GovernanceIconHovered
    },
  ];
};

export const getValidatorPublicGoodTabs = (identity: string): TabOptions[] => {
  return [
    {
      name: 'Infrastructure',
      href: `/validators/${identity}/public_goods/infrastructure`
    },
    {
      name: 'Community',
      href: `/validators/${identity}/public_goods/community`,
    },
    {
      name: 'Media',
      href: `/validators/${identity}/public_goods/media`,
    },
    {
      name: 'Tools',
      href: `/validators/${identity}/public_goods/tools`
    },
    { name: 'Others',
      href: `/validators/${identity}/public_goods/others`
    },
  ];
};

export const getNodeProfileTabs = (identity: string, valoper: string): TabOptions[] => {
  return [
    {
      name: 'TX Summary',
      href: `/validators/${identity}/${valoper}/tx_summary`,
      icon: icons.TxSummary,
      iconHovered: icons.TxSummaryHovered
    },
    {
      name: 'Voting Summary',
      href: `/validators/${identity}/${valoper}/voting_summary`,
      icon: icons.VotingSummary,
      iconHovered: icons.VotingSummaryHovered
    },
    {
      name: 'Validator Passport',
      href: `/validators/${identity}/${valoper}/validator_passport`,
      icon: icons.ValidatorPassport,
      iconHovered: icons.ValidatorPassportHovered
    },
    {
      name: 'Rich List',
      href: `/validators/${identity}/${valoper}/rich_list`,
      icon: icons.RichList,
      iconHovered: icons.RichListHovered
    },
    { name: 'Revenue',
      href: `/validators/${identity}/${valoper}/revenue`,
      icon: icons.RevenueIcon,
      iconHovered: icons.RevenueIconHovered
    },
  ];
};
