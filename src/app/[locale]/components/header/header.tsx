'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import CoCreateButton from '@/components/header/co-create-button';
import HeaderControls from '@/components/header/header-controls';
import HelpButton from '@/components/header/help-button';
import SettingsDropdown from '@/components/header/settings-dropdown';
import StoryBanner from '@/components/header/story-banner';
import { useHeaderCollapsed } from '@/context/HeaderCollapsedContext';
import { cn } from '@/utils/cn';

interface OwnProps {}

const Header: FC<OwnProps> = () => {
  const { isCollapsed } = useHeaderCollapsed();

  return (
    <div className="flex flex-col">
      <div
        aria-hidden={isCollapsed}
        className={cn(
          'overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out',
          isCollapsed ? 'pointer-events-none max-h-0 opacity-0' : 'mb-2 max-h-[200px] opacity-100',
        )}
      >
        <div className="relative hidden h-[124px] md:block">
          <Link
            href="/"
            aria-label="validatorinfo.com"
            className="group absolute left-0 top-[12px] z-10 flex h-[100px] w-[100px] shrink-0 items-center justify-center border-r border-t border-bgSt bg-table_row p-0.5 shadow-menu-button-hover hover:bg-card hover:shadow-menu-button-hover active:border-transparent active:bg-card active:shadow-menu-button-pressed"
          >
            <Image
              src="/img/icons/navbar/menu-avatar.png"
              alt="validatorinfo.com logo"
              width={96}
              height={96}
              style={{ width: 96, height: 96, maxWidth: 'none' }}
              className="grayscale drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
              priority
            />
          </Link>
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <CoCreateButton />
            <SettingsDropdown />
            <HelpButton />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <StoryBanner />
          </div>
        </div>
      </div>
      <HeaderControls />
    </div>
  );
};

export default Header;
