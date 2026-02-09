'use client';

import { FC, useCallback, useState } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';
import icons from '@/components/icons';
import NavigationBarItem from '@/components/navigation-bar/navigation-bar-item';
import { useWindowEvent } from '@/hooks/useWindowEvent';

export const mainTabs: TabOptions[] = [
  { name: 'Validators', href: '/validators', icon: icons.ValidatorsIcon, iconHovered: icons.ValidatorsIconHovered },
  { name: 'Nodes', href: '/nodes', icon: icons.NodesIcon, iconHovered: icons.NodesIconHovered },
  { name: 'Networks', href: '/networks', icon: icons.NetworksIcon, iconHovered: icons.NetworksIconHovered },
  { name: 'Ecosystems', href: '/ecosystems', icon: icons.EcosystemsIcon, iconHovered: icons.EcosystemsIconHovered },
];

export const additionalTabs: TabOptions[] = [
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
  { name: 'Rumors', href: '/p2pchat', icon: icons.RumorsIcon, iconHovered: icons.RumorsIconHovered },
];

export const aboutTabs = [
  { name: 'Metrics', href: '/metrics', icon: icons.MetricsIcon, iconHovered: icons.MetricsIconHovered },
  { name: 'Library', href: '/library', icon: icons.LibraryIcon, iconHovered: icons.LibraryIconHovered },
  { name: 'About Us', href: '/about', icon: icons.AboutIcon, iconHovered: icons.AboutIconHovered },
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
    (_tab: TabOptions, idx: number, block: 'main' | 'additional' | 'about'): boolean => {
      if (!isGameMenuMode) return false;
      const secIdx = block === 'main' ? 0 : block === 'additional' ? 1 : 2;
      return secIdx === activeSection && idx === activeItem;
    },
    [isGameMenuMode, activeSection, activeItem],
  );

  const highlightNavBar =
    hoverTarget === 'navbar' ? 'outline outline-2 outline-dottedLine outline-offset-2 duration-0' : 'outline-0';

  const highlightArrow =
    hoverTarget === 'navbar-arrow' ? 'outline outline-2 outline-dottedLine outline-offset-2' : 'outline-0';

  return (
    <div
      tabIndex={-1}
      className={`${isOpened ? 'w-[15.5rem]' : 'w-10'} relative mt-2 hidden h-full border-transparent pt-6 font-handjet transition-all duration-300 md:block ${highlightNavBar}`}
    >
      <div
        className={`${isGameMenuMode ? 'hidden' : ''} group absolute -right-6 top-0 z-20 h-full w-6 cursor-pointer from-transparent to-bgSt hover:bg-gradient-to-b`}
        onClick={() => setIsOpened(!isOpened)}
        aria-hidden={isGameMenuMode}
      >
        <div
          className={`${!isOpened ? 'rotate-180' : ''} absolute -left-1 -top-0 min-h-6 min-w-8 bg-hide bg-contain group-hover:bg-hide_h group-active:bg-hide_a ${highlightArrow}`}
        />
      </div>

      <div className={`relative space-y-2.5 ${isOpened ? 'w-[15.5rem]' : 'w-16'}`} aria-label="Main" role="group">
        {mainTabs.map((item, i) => (
          <NavigationBarItem
            key={item.name}
            item={item}
            isOpened={isOpened}
            highlighted={isItemActive(item, i, 'main')}
          />
        ))}
      </div>

      <div className="mb-5 mt-7" />

      <div className={`relative space-y-2.5 ${isOpened ? 'w-[15.5rem]' : 'w-16'}`} aria-label="Additional" role="group">
        {additionalTabs.map((item, i) => (
          <NavigationBarItem
            key={item.name}
            item={item}
            isOpened={isOpened}
            highlighted={isItemActive(item, i, 'additional')}
          />
        ))}
      </div>

      <div className="mb-5 mt-7" />

      <div className={`relative space-y-2.5 ${isOpened ? 'w-[15.5rem]' : 'w-16'}`} aria-label="About" role="group">
        {aboutTabs.map((item, i) => (
          <NavigationBarItem
            key={item.name}
            item={item}
            isOpened={isOpened}
            highlighted={isItemActive(item, i, 'about')}
          />
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;
