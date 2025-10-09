'use client';

import { useRouter } from 'next/navigation';
import React, { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import NavigationBar, { aboutTabs, additionalTabs, mainTabs } from '@/components/navigation-bar/navigation-bar';

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
      // document.body.style.overflow = 'hidden';
      onTabSelect(allTabs[0]?.href || null);
    } else {
      // document.body.style.overflow = '';
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
      className="z-[9999] bg-black px-6 py-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-dottedLine focus:duration-0"
      onKeyDown={onKeyPress}
      onMouseDown={(e) => {
        if (e.target === containerRef.current) {
          containerRef.current?.focus();
        }
      }}
    >
      <NavigationBar isGameMenuMode={true} activeSection={activeSection} activeItem={activeItem} />
    </div>
  );
};

export default MenuOverlay;
