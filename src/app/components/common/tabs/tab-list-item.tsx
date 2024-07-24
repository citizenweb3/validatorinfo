'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';

interface OwnProps {
  item: TabOptions;
}
const TabListItem: FC<OwnProps> = ({ item: { name, href, icon, iconHovered } }) => {
  const isActive = usePathname() === href;
  return (
    <Link
      href={href}
      className={`${isActive ? 'bg-gradient-to-r from-primary to-secondary text-highlight' : ''} !active:max-h-7 group relative flex min-h-10 w-full flex-grow cursor-pointer flex-row items-center justify-center overflow-hidden border-r border-t border-bgSt p-px text-sm shadow-button transition-width duration-300 hover:bg-bgSt active:top-1 active:border-transparent active:bg-background active:shadow-none`}
    >
      <div className="flex h-full w-full flex-row flex-nowrap items-center justify-center bg-background text-lg font-semibold group-hover:text-highlight hover:bg-bgSt active:bg-background">
        <div className="relative">
          {icon && (
            <Image
              src={icon}
              alt={name}
              width={26}
              height={26}
              className={`${isActive && 'hidden'} absolute left-0 top-0 mr-2 w-7 group-hover:hidden`}
            />
          )}
          {iconHovered && (
            <Image
              src={iconHovered}
              alt={name}
              width={40}
              height={40}
              className={`${isActive ? 'block' : 'hidden'} absolute -left-1.5 -top-1.5 w-10 group-hover:block`}
            />
          )}
          <div className={`${icon && 'pl-10'} overflow-hidden overflow-ellipsis text-nowrap xs:max-w-32 lg:max-w-full`}>
            {name}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TabListItem;
