'use client';

import { useRouter } from 'next/navigation';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import NavigationBar, { aboutTabs, additionalTabs, mainTabs } from '@/components/navigation-bar/navigation-bar';

interface OwnProps {
  visible: boolean;
  onClose: () => void;
  onTabSelect: (href: string) => void;
}

const MenuOverlay: FC<OwnProps> = ({ visible, onClose, onTabSelect }) => {
  const allTabs = [...mainTabs, ...additionalTabs, ...aboutTabs];
  const totalTabsCount = allTabs.length;

  const [flatItemIndex, setFlatItemIndex] = useState(0);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setFlatItemIndex(0);
      setTimeout(() => containerRef.current?.focus(), 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [visible]);

  const mapFlatIndexToSectionIndex = (flatIndex: number) => {
    if (flatIndex < mainTabs.length) return { section: 0, item: flatIndex };
    if (flatIndex < mainTabs.length + additionalTabs.length) return { section: 1, item: flatIndex - mainTabs.length };
    return { section: 2, item: flatIndex - mainTabs.length - additionalTabs.length };
  };

  const { section: activeSection, item: activeItem } = mapFlatIndexToSectionIndex(flatItemIndex);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!visible) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFlatItemIndex((i) => (i + 1) % totalTabsCount);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFlatItemIndex((i) => (i - 1 + totalTabsCount) % totalTabsCount);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const href = allTabs[flatItemIndex]?.href;
        if (href) {
          onClose();
          onTabSelect(href);
          router.push(href);
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
      className="z-[9999] bg-black px-6 py-2 focus:outline-none"
      onKeyDown={onKeyDown}
    >
      <NavigationBar isGameMenuMode={true} activeSection={activeSection} activeItem={activeItem} />
    </div>
  );
};

export default MenuOverlay;
