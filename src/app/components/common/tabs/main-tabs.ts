import { StaticImageData } from 'next/image';

import icons from '@/components/icons';

export interface TabOptions {
  name: string;
  href: string;
  icon?: StaticImageData;
  iconHovered?: StaticImageData;
  isSelected?: boolean;
}

const mainTabs: TabOptions[] = [
  { name: 'Staking Calc', href: '/calculator', icon: icons.CalculatorIcon },
  { name: 'Validator Comparison', href: '/comparison', icon: icons.ComparisonIcon, isSelected: true },
  { name: 'ValidatorInfo', href: '/validators', icon: icons.ValidatorsIcon },
  { name: 'Rumors', href: '/rumors', icon: icons.NetworksIcon },
  { name: 'Global POS', href: '/pos' },
];

export default mainTabs;
