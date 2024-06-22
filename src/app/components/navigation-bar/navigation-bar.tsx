'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

import icons from '@/app/components/icons';
import { TabOptions } from '@/components/common/tabs/tabs-data';
import NavigationBarItem from '@/components/navigation-bar/navigation-bar-item';

interface OwnProps {}

const data: TabOptions[] = [
  { name: 'Validators', href: '/validators', icon: icons.ValidatorsIcon, iconHovered: icons.ValidatorsIconHovered },
  { name: 'Networks', href: '/networks', icon: icons.NetworksIcon, iconHovered: icons.NetworksIconHovered },
  { name: 'Metrics', href: '/metrics', icon: icons.MetricsIcon, iconHovered: icons.MetricsIconHovered },
  {
    name: 'Staking Calculator',
    href: '/calculator',
    icon: icons.CalculatorIcon,
    iconHovered: icons.CalculatorIconHovered,
  },
  {
    name: 'Validator Comparison',
    href: '/comparison',
    icon: icons.ComparisonIcon,
    iconHovered: icons.ComparisonIconHovered,
  },
  { name: 'Rumors', href: '/rumors', icon: icons.NetworksIcon, iconHovered: icons.NetworksIconHovered },
  { name: 'Library', href: '/library', icon: icons.LibraryIcon, iconHovered: icons.LibraryIconHovered },
  { name: 'About Us', href: '/about', icon: icons.AboutIcon, iconHovered: icons.AboutIconHovered },
];

const NavigationBar: FC<OwnProps> = ({}) => {
  const [isOpened, setIsOpened] = useState<boolean>(true);
  return (
    <div
      className={`${isOpened ? 'w-56' : 'w-16'} transition-300 relative mt-2 h-[75vh] border-r-[1.5rem] border-transparent pt-6 transition-all`}
    >
      <Image
        src={icons.HideIcon}
        alt="hide"
        className={`${!isOpened && 'rotate-180'} absolute -right-6 top-0 w-6`}
        onClick={() => setIsOpened(!isOpened)}
      />
      <div className="relative space-y-2.5 overflow-hidden">
        {data.map((item) => (
          <NavigationBarItem key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;
