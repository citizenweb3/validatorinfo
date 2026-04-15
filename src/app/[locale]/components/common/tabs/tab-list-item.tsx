'use client';

import { NamespaceKeys, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  item: TabOptions;
}

const menuButtonRaisedShadow = 'shadow-menu-button-hover';
const menuButtonSelectedShadow = 'shadow-menu-button-rest';
const menuButtonHoverShadow = 'hover:shadow-menu-button-hover';
const menuButtonPressedShadow = 'active:shadow-menu-button-pressed';

const TabListItem: FC<OwnProps> = ({ page, item: { name, href, icon, iconHovered, isScroll = true } }) => {
  const isActive = usePathname() === href;
  const t = useTranslations(`${page}.Tabs` as NamespaceKeys<IntlMessages, 'HomePage.Tabs'>);

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`${
        isActive
          ? `border border-bgSt bg-card text-highlight ${menuButtonSelectedShadow}`
          : `border-r border-t border-bgSt bg-table_row ${menuButtonRaisedShadow}`
      } ${menuButtonHoverShadow} ${menuButtonPressedShadow} group relative mt-12 flex min-h-36 min-w-0 w-full flex-grow cursor-pointer flex-row items-center justify-center overflow-hidden p-0.5 text-sm transition-width duration-300 hover:bg-card hover:text-highlight active:border-transparent active:bg-card sm:mt-12 sm:min-h-20 md:mt-0 md:min-h-10`}
      scroll={isScroll}
    >
      <div className="flex h-full w-full flex-row flex-nowrap items-center justify-center text-base font-semibold group-hover:text-highlight">
        <div className="relative">
          {icon && (
            <Image
              src={icon}
              alt={name}
              width={120}
              height={120}
              className={`${isActive && 'hidden'} w-36 object-contain group-hover:hidden sm:w-20 md:absolute md:-left-1 md:top-1/2 md:w-10 md:-translate-y-1/2`}
            />
          )}
          {iconHovered && (
            <Image
              src={iconHovered}
              alt={name}
              width={120}
              height={120}
              className={`${isActive ? 'block' : 'hidden'} w-36 object-contain group-hover:block sm:w-20 md:absolute md:-left-1 md:top-1/2 md:w-10 md:-translate-y-1/2`}
            />
          )}
          <div
            className={`${icon && 'pl-10'} overflow-hidden overflow-ellipsis text-nowrap font-handjet text-lg tracking-wide xs:max-w-32 lg:max-w-full`}
          >
            <div className="hidden md:block">{t(name as 'ValidatorInfo')}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TabListItem;
