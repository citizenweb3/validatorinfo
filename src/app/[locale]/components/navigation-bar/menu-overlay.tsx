'use client';

import { useRouter } from 'next/navigation';
import React, { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { aboutTabs, additionalTabs, mainTabs } from '@/components/navigation-bar/navigation-bar';

interface OwnProps {
  visible: boolean;
  onClose: () => void;
  onTabSelect: (href: string | null) => void;
  doSelect: boolean;
  onSelectProcessed: () => void;
}

const MenuOverlay: FC<OwnProps> = ({ visible, onClose, onTabSelect, doSelect, onSelectProcessed }) => {
  const allTabs = [...mainTabs, ...additionalTabs, ...aboutTabs];
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
      document.body.style.overflow = 'hidden';
      onTabSelect(allTabs[0]?.href || null);
    } else {
      document.body.style.overflow = '';
      onTabSelect(null);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && doSelect) {
      const href = allTabs[flatItemIndex]?.href;
      if (href) {
        router.push(href);
        onClose();
      }
      onSelectProcessed();
    }
  }, [doSelect]);

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
      className="z-[9999] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-dottedLine focus:duration-0"
      onKeyDown={onKeyPress}
      onMouseDown={(e) => {
        if (e.target === containerRef.current) {
          containerRef.current?.focus();
        }
      }}
    >
      <div
        className="relative aspect-[703/418] w-[min(35vw,43.9375rem)] rounded-none border-0 bg-[#9DABA0] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_4px_4px_rgba(0,0,0,0.25),0_4px_6px_rgba(0,0,0,1)]"
      >
        <div className="absolute left-0 right-0 top-1 h-1 bg-[#19281C]" />
        <div className="absolute bottom-1 left-0 right-0 h-1 bg-[#19281C]" />

        <div className="px-6 pt-6">
          <p className="font-handjet text-xl font-bold tracking-[0.05em] text-black">
            FOR RANDOM: <span className="px-1">(A)</span> VALIDATOR <span className="px-1">(B)</span> NETWORK
          </p>
        </div>

        <div className="mt-4 px-6 pb-4" role="menu" aria-label="Menu items">
          {allTabs.map((item, idx) => {
            const isActive = idx === flatItemIndex;
            const code = 100 + idx;
            return (
              <div
                key={item.name}
                role="menuitem"
                aria-selected={isActive}
                tabIndex={-1}
                className={`mb-2 flex cursor-pointer items-center justify-between rounded-sm border border-transparent px-3 py-2 font-handjet text-lg tracking-[0.05em] transition-colors ${
                  isActive ? 'bg-black text-white' : 'text-black hover:bg-[#19281C]/10'
                }`}
                onMouseEnter={() => setFlatItemIndex(idx)}
                onClick={() => {
                  const href = item.href;
                  if (href) {
                    router.push(href);
                    onClose();
                  }
                }}
              >
                <span className="uppercase">{item.name}</span>
                <span className="ml-4 font-bold tabular-nums">{code}</span>
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-4">
          <p className="font-handjet text-base font-bold tracking-[0.05em] text-black">May the code be whit you!</p>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
