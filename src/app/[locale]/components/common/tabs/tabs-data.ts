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

export const getValidatorProfileTabs = (validatorIdentity: string): TabOptions[] => {
  return [
    {
      name: 'Revenue',
      href: `/validators/${validatorIdentity}/revenue`
    },
    {
      name: 'Metrics',
      href: `/validators/${validatorIdentity}/metrics`,
      icon: icons.MetricsIcon,
      iconHovered: icons.MetricsIconHovered
    },
    {
      name: 'Network Table',
      href: `/validators/${validatorIdentity}/networks`,
      icon: icons.NetworksIcon,
      iconHovered: icons.NetworksIconHovered
    },
    {
      name: 'Public Good',
      href: `/validators/${validatorIdentity}/public_good`
    },
    { name: 'Governance',
      href: `/validators/${validatorIdentity}/governance`
    },
  ];
};

export const getValidatorPublicGoodTabs = (validatorIdentity: string): TabOptions[] => {
  return [
    {
      name: 'Infrastructure',
      href: `/validators/${validatorIdentity}/public_good/infrastructure`
    },
    {
      name: 'Community',
      href: `/validators/${validatorIdentity}/public_good/community`,
    },
    {
      name: 'Media',
      href: `/validators/${validatorIdentity}/public_good/media`,
    },
    {
      name: 'Tools',
      href: `/validators/${validatorIdentity}/public_good/tools`
    },
    { name: 'Others',
      href: `/validators/${validatorIdentity}/public_good/others`
    },
  ];
};
