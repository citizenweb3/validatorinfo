'use client';

import { FC, useCallback, useState } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';
import icons from '@/components/icons';
import { useWindowEvent } from '@/hooks/useWindowEvent';

import NavigationBarItem from './navigation-bar-item';

export const homeTabs: TabOptions[] = [
  { name: 'Home', href: '/', icon: icons.GeneralIcon, iconHovered: icons.GeneralIconHovered },
  { name: 'You', href: '/profile', icon: icons.ContactsIcon, iconHovered: icons.ContactsIconHovered },
  { name: 'AI', href: '/ai', icon: icons.RabbitIcon, iconHovered: icons.RabbitIconHovered },
  { name: 'About Us', href: '/about', icon: icons.AboutIcon, iconHovered: icons.AboutIconHovered },
  { name: 'Play', href: '/library', icon: icons.LibraryIcon, iconHovered: icons.LibraryIconHovered },
];

export const networkTabs: TabOptions[] = [
  { name: 'Networks', href: '/networks', icon: icons.NetworksIcon, iconHovered: icons.NetworksIconHovered },
  { name: 'Validators', href: '/validators', icon: icons.ValidatorsIcon, iconHovered: icons.ValidatorsIconHovered },
  { name: 'Nodes', href: '/nodes', icon: icons.NodesIcon, iconHovered: icons.NodesIconHovered },
  { name: 'Mining Pools', href: '/mining-pools', icon: icons.NodesIcon, iconHovered: icons.NodesIconHovered },
  { name: 'Ecosystems', href: '/ecosystems', icon: icons.EcosystemsIcon, iconHovered: icons.EcosystemsIconHovered },
];

export const toolsTabs: TabOptions[] = [
  { name: 'Rumor', href: '/p2pchat', icon: icons.RumorsIcon, iconHovered: icons.RumorsIconHovered },
  { name: 'Analyze', href: '/web3stats', icon: icons.GlobalIcon, iconHovered: icons.GlobalIconHovered },
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
  { name: 'Explain', href: '/metrics', icon: icons.MetricsIcon, iconHovered: icons.MetricsIconHovered },
];

interface OwnProps {
  isGameMenuMode?: boolean;
  activeSection?: number;
  activeItem?: number;
}

const NavigationBar: FC<OwnProps> = ({ isGameMenuMode = false, activeSection = 0, activeItem = 0 }) => {
  const [isOpened, setIsOpened] = useState<boolean>(true);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);

  const onSectionHover = useCallback((detail: string | null) => {
    setHoverTarget(detail);
  }, []);

  useWindowEvent<string | null>('section:hover', onSectionHover);

  const isItemActive = useCallback(
    (_tab: TabOptions, idx: number, block: 'home' | 'network' | 'tools'): boolean => {
      if (!isGameMenuMode) return false;
      const secIdx = block === 'home' ? 0 : block === 'network' ? 1 : 2;
      return secIdx === activeSection && idx === activeItem;
    },
    [isGameMenuMode, activeSection, activeItem],
  );

  const highlightNavBar =
    hoverTarget === 'navbar' ? 'outline outline-2 outline-dottedLine outline-offset-2 duration-0' : 'outline-0';
  const highlightArrow =
    hoverTarget === 'navbar-arrow' ? 'outline outline-2 outline-dottedLine outline-offset-2' : 'outline-0';

  const renderGroup = (tabs: TabOptions[], ariaLabel: string, block: 'home' | 'network' | 'tools') => (
    <div
      className={`relative space-y-2.5 ${isOpened ? 'w-navigation-open' : 'w-16'}`}
      aria-label={ariaLabel}
      role="group"
    >
      {tabs.map((item, index) => (
        <NavigationBarItem
          key={item.name}
          item={item}
          isOpened={isOpened}
          highlighted={isItemActive(item, index, block)}
        />
      ))}
    </div>
  );

  return (
    <div
      tabIndex={-1}
      className={`${isOpened ? 'w-navigation-open' : 'w-10'} relative mt-2 hidden h-full border-transparent pt-2 font-handjet transition-all duration-300 md:block ${highlightNavBar}`}
    >
      <div
        className={`${isGameMenuMode ? 'hidden' : ''} group absolute -right-7 top-0 z-20 h-full w-6 cursor-pointer from-transparent to-bgSt hover:bg-gradient-to-b`}
        onClick={() => setIsOpened((prev) => !prev)}
        aria-hidden={isGameMenuMode}
      >
        <div
          className={`${!isOpened ? 'rotate-180' : ''} absolute -left-1 -top-0 min-h-6 min-w-8 bg-hide bg-contain group-hover:bg-hide_h group-active:bg-hide_a ${highlightArrow}`}
        />
      </div>

      {renderGroup(homeTabs, 'Home', 'home')}

      <div className="mb-4 mt-6" />

      {renderGroup(networkTabs, 'Networks', 'network')}

      <div className="mb-4 mt-6" />

      {renderGroup(toolsTabs, 'Tools', 'tools')}
    </div>
  );
};

export default NavigationBar;
