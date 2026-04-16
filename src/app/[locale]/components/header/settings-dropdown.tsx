'use client';

import { useTranslations } from 'next-intl';
import { FC, useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import CurrencySwitcher from '@/components/header/currency-switcher';
import LanguageSwitcher from '@/components/header/language-switcher';
import ThemeSwitcher from '@/components/header/theme-switcher';

const SettingsDropdown: FC = () => {
  const t = useTranslations('Header');
  const [isOpened, setIsOpened] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpened((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, []);

  useOnClickOutside(dropdownRef, handleClose);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="group flex h-6 w-7 items-center justify-center border-r border-t border-bgSt bg-table_row shadow-menu-button-rest hover:bg-bgHover hover:shadow-menu-button-hover active:border-transparent active:bg-card active:shadow-menu-button-pressed"
        aria-label={t('Settings')}
        aria-expanded={isOpened}
      >
        <span
          className="pointer-events-none h-4 w-4 bg-settings bg-contain bg-center bg-no-repeat group-hover:bg-settings_h group-active:bg-settings_h"
          aria-hidden
        />
      </button>

      {isOpened && (
        <div className="absolute right-0 top-full z-50 mt-2 w-max border border-bgSt bg-background p-1.5 shadow-button">
          <div className="flex flex-col gap-1.5">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
