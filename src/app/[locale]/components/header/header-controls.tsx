'use client';

import { useTranslations } from 'next-intl';
import { FC, useCallback, useState } from 'react';

import HeaderSearch from '@/components/header/header-search/header-search';
import MenuBurgerButton from '@/components/navigation-bar/menu-burger-button';
import MobileNavigationBar from '@/components/navigation-bar/mobile-navigation-bar';
import { useHeaderCollapsed } from '@/context/HeaderCollapsedContext';
import { useWindowEvent } from '@/hooks/useWindowEvent';
import { cn } from '@/utils/cn';

interface OwnProps {}

const HeaderControls: FC<OwnProps> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const { isCollapsed, toggle } = useHeaderCollapsed();
  const t = useTranslations('Header');

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
      <button
        type="button"
        onClick={toggle}
        aria-label={isCollapsed ? t('Expand header') : t('Collapse header')}
        aria-expanded={!isCollapsed}
        className="group/toggle hidden h-10 w-7 items-center justify-center md:flex"
      >
        <div className="relative h-8 w-5">
          <div
            className={cn(
              'absolute left-1/2 top-1/2 min-h-5 min-w-7 -translate-x-1/2 -translate-y-1/2 transform bg-hide bg-contain bg-no-repeat transition-transform duration-300 group-hover/toggle:bg-hide_h group-active/toggle:bg-hide_a',
              isCollapsed ? '-rotate-90' : 'rotate-90',
            )}
          />
        </div>
      </button>
      <div className="block md:hidden">
        <MenuBurgerButton isOpened={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />
      </div>
      <MobileNavigationBar isOpened={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
};

export default HeaderControls;
