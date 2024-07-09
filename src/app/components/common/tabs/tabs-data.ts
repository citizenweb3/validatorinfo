import { StaticImageData } from 'next/image';

import icons from '@/components/icons';

export interface TabOptions {
  name: string;
  href: string;
  icon?: StaticImageData;
  iconHovered?: StaticImageData;
}

export const validatorTabs: TabOptions[] = [
  {
    name: 'Staking Calc',
    href: '/staking_calculator',
    icon: icons.CalculatorIcon,
    iconHovered: icons.CalculatorIconHovered,
  },
  {
    name: 'Val. Comparison',
    href: '/validator_comparison',
    icon: icons.ComparisonIcon,
    iconHovered: icons.ComparisonIconHovered,
  },
  { name: 'ValidatorInfo', href: '/validators', icon: icons.ValidatorsIcon, iconHovered: icons.ValidatorsIconHovered },
  { name: 'Rumors', href: '/rumors', icon: icons.RumorsIcon, iconHovered: icons.RumorsIconHovered },
  { name: 'Global POS', href: '/global_pos' },
];

export const aboutTabs: TabOptions[] = [
  { name: 'Staking', href: '/about/staking' },
  { name: 'Partners', href: '/about/partners' },
  { name: 'General Info', href: '/about' },
  { name: 'Podcasts', href: '/about/podcasts' },
  { name: 'Contacts', href: '/about/contacts' },
];
