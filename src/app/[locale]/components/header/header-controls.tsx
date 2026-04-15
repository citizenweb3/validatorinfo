'use client';

import { FC, useCallback, useState } from 'react';

import HeaderSearch from '@/components/header/header-search/header-search';
import MenuBurgerButton from '@/components/navigation-bar/menu-burger-button';
import MobileNavigationBar from '@/components/navigation-bar/mobile-navigation-bar';
import { useWindowEvent } from '@/hooks/useWindowEvent';

interface OwnProps {}

const HeaderControls: FC<OwnProps> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);

  const onSectionHover = useCallback((detail: string | null) => {
    setHoverTarget(detail);
  }, []);

  useWindowEvent<string | null>('section:hover', onSectionHover);

  const highlight =
    hoverTarget === 'header'
      ? 'outline outline-2 outline-dottedLine outline-offset-2'
      : 'outline-0';

  return (
    <div className={`flex w-full items-center gap-2 sm:gap-2.5 ${highlight}`}>
      <div className="min-w-0 flex-1">
        <HeaderSearch />
      </div>
      <div className="block md:hidden">
        <MenuBurgerButton isOpened={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />
      </div>
      <MobileNavigationBar isOpened={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
};

export default HeaderControls;
