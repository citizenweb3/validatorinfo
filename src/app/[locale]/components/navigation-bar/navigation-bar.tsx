'use client';

import { FC, useState } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';
import icons from '@/components/icons';
import NavigationBarItem from '@/components/navigation-bar/navigation-bar-item';

interface OwnProps {
}

export const mainTabs: TabOptions[] = [
  { name: 'Validators', href: '/validators', icon: icons.ValidatorsIcon, iconHovered: icons.ValidatorsIconHovered },
  { name: 'Nodes', href: '/nodes', icon: icons.NodesIcon, iconHovered: icons.NodesIconHovered },
  { name: 'Networks', href: '/networks', icon: icons.NetworksIcon, iconHovered: icons.NetworksIconHovered },
  { name: 'Ecosystems', href: '/ecosystems', icon: icons.EcosystemsIcon, iconHovered: icons.EcosystemsIconHovered },
];

export const additionalTabs: TabOptions[] = [
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
  { name: 'Rumors', href: '/p2pchat', icon: icons.RumorsIcon, iconHovered: icons.RumorsIconHovered },
  { name: 'Global', href: '/web3stats', icon: icons.GlobalIcon, iconHovered: icons.GlobalIconHovered }];

export const aboutTabs = [
  { name: 'Metrics', href: '/metrics', icon: icons.MetricsIcon, iconHovered: icons.MetricsIconHovered },
  { name: 'Library', href: '/library', icon: icons.LibraryIcon, iconHovered: icons.LibraryIconHovered },
  { name: 'About Us', href: '/about', icon: icons.AboutIcon, iconHovered: icons.AboutIconHovered },
];

const NavigationBar: FC<OwnProps> = () => {
  const [isOpened, setIsOpened] = useState<boolean>(true);
  return (
    <div
      className={`${isOpened ? 'w-[15.5rem]' : 'w-10'} hidden md:block relative mt-2 border-transparent pt-6 font-handjet transition-all duration-300`}
    >
      <div
        className="group absolute -right-6 top-0 z-20 h-full w-6 cursor-pointer bg-opacity-30 from-transparent to-bgSt hover:bg-gradient-to-b"
        onClick={() => setIsOpened(!isOpened)}
      >
        <div
          className={`${!isOpened ? 'rotate-180' : ''} absolute -left-1 -top-0 min-h-6 min-w-8 bg-hide bg-contain group-hover:bg-hide_h group-active:bg-hide_a`}
        />
      </div>
      <div className={`relative space-y-2.5 ${isOpened ? 'w-[15.5rem]' : 'w-16'}`}>
        {mainTabs.map((item) => (
          <NavigationBarItem key={item.name} item={item} isOpened={isOpened} />
        ))}
      </div>

      <div className="mt-7 mb-5" />

      <div className={`relative space-y-2.5 ${isOpened ? 'w-[15.5rem]' : 'w-16'}`}>
        {additionalTabs.map((item) => (
          <NavigationBarItem key={item.name} item={item} isOpened={isOpened} />
        ))}
      </div>

      <div className="mt-7 mb-5" />

      <div className={`relative space-y-2.5 ${isOpened ? 'w-[15.5rem]' : 'w-16'}`}>
        {aboutTabs.map((item) => (
          <NavigationBarItem key={item.name} item={item} isOpened={isOpened} />
        ))}
      </div>

    </div>
  );
};

export default NavigationBar;
