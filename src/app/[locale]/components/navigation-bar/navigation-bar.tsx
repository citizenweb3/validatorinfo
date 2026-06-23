'use client';

import { FC, useCallback, useState } from 'react';

import { homeTabs, networkTabs, toolsTabs, TabOptions } from '@/components/common/tabs/tabs-data';
import { useWindowEvent } from '@/hooks/useWindowEvent';

import NavigationBarItem from './navigation-bar-item';

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
