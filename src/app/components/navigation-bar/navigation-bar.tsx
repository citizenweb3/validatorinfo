'use client';

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
  { name: 'Rumors', href: '/rumors', icon: icons.RumorsIcon, iconHovered: icons.RumorsIconHovered },
  { name: 'Library', href: '/library', icon: icons.LibraryIcon, iconHovered: icons.LibraryIconHovered },
  { name: 'About Us', href: '/about', icon: icons.AboutIcon, iconHovered: icons.AboutIconHovered },
];

const NavigationBar: FC<OwnProps> = ({}) => {
  const [isOpened, setIsOpened] = useState<boolean>(true);
  return (
    <div
      className={`${isOpened ? 'w-[15.5rem]' : 'w-10'} relative mt-2 h-[26rem] border-r-[1.5rem] border-transparent pt-6 transition-all duration-300`}
    >
      <div
        className="group absolute -right-12 top-0 h-full w-6 cursor-pointer bg-opacity-30 from-transparent to-bgSt hover:bg-gradient-to-b"
        onClick={() => setIsOpened(!isOpened)}
      >
        <div
          className={`${!isOpened && 'rotate-180'} absolute -left-1 -top-4 min-h-8 min-w-8 bg-[url('/img/icons/navbar/hide.png')] bg-contain group-hover:bg-[url('/img/icons/navbar/hide-hovered.png')]`}
        />
      </div>
      <div className={`relative space-y-2.5 ${isOpened ? 'w-[15.5rem]' : 'w-16'}`}>
        {data.map((item) => (
          <NavigationBarItem key={item.name} item={item} isOpened={isOpened} />
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;
