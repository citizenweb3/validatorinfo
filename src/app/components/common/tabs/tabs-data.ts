import { StaticImageData } from 'next/image';

import icons from '@/components/icons';

export interface TabOptions {
  name: string;
  href: string;
  icon?: StaticImageData;
  iconHovered?: StaticImageData;
}

export const validatorTabs: TabOptions[] = [
  { name: 'Staking Calc', href: '/calculator', icon: icons.CalculatorIcon },
  { name: 'Validator Comparison', href: '/comparison', icon: icons.ComparisonIcon },
  { name: 'ValidatorInfo', href: '/validators', icon: icons.ValidatorsIcon },
  { name: 'Rumors', href: '/rumors', icon: icons.NetworksIcon },
  { name: 'Global POS', href: '/pos' },
];

export const aboutTabs: TabOptions[] = [
  { name: 'Staking', href: '/about/staking' },
  { name: 'Partners', href: '/about/partners' },
  { name: 'General Info', href: '/about' },
  { name: 'Podcasts', href: '/about/podcasts' },
  { name: 'Contacts', href: '/about/contacts' },
];
