'use client';

import { NamespaceKeys, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';

interface OwnProps {
  page: 'HomePage' | 'AboutPage';
  item: TabOptions;
}
const TabListItem: FC<OwnProps> = ({ page, item: { name, href, icon, iconHovered } }) => {
  const isActive = usePathname() === href;
  const t = useTranslations(`${page}.Tabs` as NamespaceKeys<IntlMessages, 'HomePage.Tabs'>);

  return (
    <Link
      href={href}
      className={`${isActive ? 'border-none bg-gradient-to-r from-primary to-secondary text-highlight' : 'border-r border-t border-bgSt'} !active:max-h-7 hover:bg-bgHover group relative flex min-h-10 w-full flex-grow cursor-pointer flex-row items-center justify-center overflow-hidden p-px text-sm shadow-button transition-width duration-300 active:top-1 active:border-transparent active:bg-background active:shadow-none`}
    >
      <div className="hover:bg-bgHover flex h-full w-full flex-row flex-nowrap items-center justify-center bg-background text-base font-semibold group-hover:text-highlight active:bg-background">
        <div className="relative">
          {icon && (
            <Image
              src={icon}
              alt={name}
              width={26}
              height={26}
              className={`${isActive && 'hidden'} absolute -top-0.5 left-0 mr-2 w-7 group-hover:hidden`}
            />
          )}
          {iconHovered && (
            <Image
              src={iconHovered}
              alt={name}
              width={40}
              height={40}
              className={`${isActive ? 'block' : 'hidden'} absolute -left-1.5 -top-2 w-10 group-hover:block`}
            />
          )}
          <div
            className={`${icon && 'pl-10'} overflow-hidden overflow-ellipsis text-nowrap uppercase xs:max-w-32 lg:max-w-full`}
          >
            {t(name as 'ValidatorInfo')}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TabListItem;
