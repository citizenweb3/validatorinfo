'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

const HelpButton = () => {
  const t = useTranslations('Header');

  return (
    <Link
      href="/help"
      className="group flex h-7 w-12 items-center justify-center border-r border-t border-bgSt bg-table_row px-0.5 shadow-menu-button-rest hover:bg-bgHover hover:text-highlight hover:shadow-menu-button-hover active:border-transparent active:bg-card active:shadow-menu-button-pressed"
      aria-label={t('Help')}
    >
      <span className="font-sfpro text-base leading-none tracking-button text-highlight group-active:text-shadow-none">
        {t('Help')}
      </span>
    </Link>
  );
};

export default HelpButton;
