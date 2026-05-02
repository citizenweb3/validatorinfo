'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { homeTabs, networkTabs, toolsTabs } from '@/components/navigation-bar/navigation-bar';

interface OwnProps {
  visible: boolean;
  onClose: () => void;
  onTabSelect: (href: string | null) => void;
  doSelect: boolean;
  onSelectProcessed: () => void;
}

const MenuOverlay: FC<OwnProps> = ({ visible, onClose, onTabSelect, doSelect, onSelectProcessed }) => {
  const t = useTranslations('Navbar');
  const allTabs = useMemo(() => [...homeTabs, ...networkTabs, ...toolsTabs], []);
  const totalTabsCount = allTabs.length;

  const [flatItemIndex, setFlatItemIndex] = useState(0);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    onTabSelect(allTabs[flatItemIndex]?.href || null);
  }, [flatItemIndex, allTabs, onTabSelect]);

  useEffect(() => {
    if (visible) {
      setFlatItemIndex(0);
      setTimeout(() => containerRef.current?.focus(), 0);
      onTabSelect(allTabs[0]?.href || null);
    } else {
      onTabSelect(null);
    }
  }, [visible, onTabSelect, allTabs]);

  useEffect(() => {
    if (visible && doSelect) {
      const href = allTabs[flatItemIndex]?.href;
      if (href) {
        router.push(href);
        onClose();
      }
      onSelectProcessed();
    }
  }, [visible, doSelect, allTabs, flatItemIndex, router, onClose, onSelectProcessed]);

  const mapFlatIndexToSectionIndex = (flatIndex: number) => {
    if (flatIndex < homeTabs.length) return { section: 0, item: flatIndex };
    if (flatIndex < homeTabs.length + networkTabs.length) return { section: 1, item: flatIndex - homeTabs.length };
    return { section: 2, item: flatIndex - homeTabs.length - networkTabs.length };
  };

  const { section: activeSection, item: activeItem } = mapFlatIndexToSectionIndex(flatItemIndex);

  const onKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!visible) return;

      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Tab') {
        e.preventDefault();
        setFlatItemIndex((i) => (i + 1) % totalTabsCount);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFlatItemIndex((i) => (i - 1 + totalTabsCount) % totalTabsCount);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const href = allTabs[flatItemIndex]?.href;
        if (href) {
          router.push(href);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [visible, flatItemIndex, router, onClose, allTabs, totalTabsCount],
  );

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label="Game menu"
      className="z-game-menu"
      onKeyDown={onKeyPress}
      onMouseDown={(e) => {
        if (e.target === containerRef.current) {
          containerRef.current?.focus();
        }
      }}
    >
      <div
        className="relative rounded-none border-0 bg-gameboyBody font-handjet font-semibold text-black shadow-game-menu
        lg:h-game-menu-lg lg:w-game-menu-lg lg:text-sm xl:h-game-menu-lg xl:w-game-menu-xl xl:text-base 2xl:h-game-menu-2xl 2xl:w-game-menu-2xl 2xl:text-lg"
      >
        <div className="absolute left-0 right-0 top-1 my-4 h-1 bg-gameboyStripe" />
        <div className="absolute bottom-1 left-0 right-0 my-4 h-1 bg-gameboyStripe" />

        <div className="pt-10 text-center">
          <p className="font-handjet text-xl font-semibold">
            FOR RANDOM: <span className="pl-2">(A)</span> VALIDATOR <span className="pl-2">(B)</span> NETWORK
          </p>
        </div>

        <div className="mt-8" role="menu" aria-label="Menu items">
          {allTabs.map((item, idx) => {
            const isActive = idx === flatItemIndex;
            const code = 100 + idx;
            const section = mapFlatIndexToSectionIndex(idx);
            const isSectionActive = section.section === activeSection && section.item === activeItem;

            return (
              <div
                key={item.name}
                role="menuitem"
                data-active={isActive || isSectionActive ? 'true' : undefined}
                tabIndex={-1}
                className="flex cursor-pointer items-center justify-center"
                onMouseEnter={() => setFlatItemIndex(idx)}
                onClick={() => {
                  const href = item.href;
                  if (href) {
                    router.push(href);
                    onClose();
                  }
                }}
              >
                <div className="flex flex-row items-center justify-center uppercase">
                  {isActive && <div className="mr-2 h-5 w-5 bg-console_menu_arrow bg-contain bg-center bg-no-repeat" />}
                  <span>{code} -</span>
                  <span>&nbsp;{t(item.name as 'Home')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
