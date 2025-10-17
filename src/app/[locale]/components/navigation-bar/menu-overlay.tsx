'use client';

import { useRouter } from 'next/navigation';
import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { aboutTabs, additionalTabs, mainTabs } from '@/components/navigation-bar/navigation-bar';

interface OwnProps {
  visible: boolean;
  onClose: () => void;
  onTabSelect: (href: string | null) => void;
  doSelect: boolean;
  onSelectProcessed: () => void;
}

const MenuOverlay: FC<OwnProps> = ({ visible, onClose, onTabSelect, doSelect, onSelectProcessed }) => {
  const allTabs = useMemo(() => [...mainTabs, ...additionalTabs, ...aboutTabs], []);
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
    if (flatIndex < mainTabs.length) return { section: 0, item: flatIndex };
    if (flatIndex < mainTabs.length + additionalTabs.length) return { section: 1, item: flatIndex - mainTabs.length };
    return { section: 2, item: flatIndex - mainTabs.length - additionalTabs.length };
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
      className="z-[9999]"
      onKeyDown={onKeyPress}
      onMouseDown={(e) => {
        if (e.target === containerRef.current) {
          containerRef.current?.focus();
        }
      }}
    >
      <div
        className="relative rounded-none border-0 bg-[#9DABA0] font-handjet font-semibold text-black
        shadow-[0_4px_4px_rgba(0,0,0,0.25),0_4px_4px_rgba(0,0,0,0.25),0_4px_6px_rgba(0,0,0,1)] lg:h-[25rem] lg:w-[32rem]
        lg:text-base xl:h-[25rem] xl:w-[35rem] xl:text-lg 2xl:h-[28rem] 2xl:w-[40rem] 2xl:text-xl"
      >
        <div className="absolute left-0 right-0 top-1 my-4 h-1 bg-[#19281C]" />
        <div className="absolute bottom-1 left-0 right-0 my-4 h-1 bg-[#19281C]" />

        <div className="pt-10 text-center">
          <p className="font-handjet text-xl font-semibold ">
            FOR RANDOM: <span className="pl-2">(A)</span> VALIDATOR <span className="pl-2">(B)</span> NETWORK
          </p>
        </div>

        <div className="mt-8" role="menu" aria-label="Menu items">
          {allTabs.map((item, idx) => {
            const isActive = idx === flatItemIndex;
            const code = 100 + idx;
            return (
              <div
                key={item.name}
                role="menuitem"
                aria-selected={isActive}
                tabIndex={-1}
                className={`flex cursor-pointer items-center justify-center`}
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
                  <span className="">{code} -</span>
                  <span className="">&nbsp;{item.name}</span>
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
