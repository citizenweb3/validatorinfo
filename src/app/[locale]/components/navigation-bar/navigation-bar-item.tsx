'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';
import { usePathname } from '@/i18n';

interface OwnProps {
  item: TabOptions;
  isOpened: boolean;
}

const NavigationBarItem: FC<OwnProps> = ({ item: { name, href, icon, iconHovered }, isOpened }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const t = useTranslations('Navbar');

  return (
    <Link
      href={href}
      className={`${isActive ? 'border-none bg-gradient-to-r from-primary to-secondary' : 'border-r border-t border-bgSt'} ${isOpened ? 'md:min-h-10 md:w-[15.5rem] sm:min-h-24 min-h-44' : 'h-10 w-10 hover:border-highlight'} !active:max-h-7 group relative flex cursor-pointer flex-col items-center overflow-hidden p-px text-sm shadow-button transition-width duration-300 hover:bg-bgHover active:top-1 active:border-transparent active:bg-background active:shadow-none`}
    >
      <div className="relative flex h-full w-full flex-grow flex-row flex-nowrap items-center overflow-hidden bg-background text-base font-semibold group-hover:text-highlight hover:bg-bgHover active:bg-background">
        <div className="absolute md:left-5 md:top-[1.15rem] md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
          {icon && <Image src={icon} alt={name} width={120} height={120} priority className="md:min-w-10 md:max-w-10 sm:min-w-16 sm:max-w-16 min-w-32 max-w-32" />}
        </div>
        <div
          className={`${isActive ? 'block' : 'hidden group-hover:block'} absolute md:left-5 md:top-[1.15rem] md:-translate-x-1/2 md:-translate-y-1/2 md:transform`}
        >
          {iconHovered && (
            <Image src={iconHovered} alt={name} width={120} height={120} priority className="md:min-w-10 md:max-w-10 sm:min-w-16 sm:max-w-16 min-w-32 max-w-32" />
          )}
        </div>
        <div
          className={`${isActive && 'text-highlight'} md:ml-14 sm:ml-20 ml-36 text-nowrap font-handjet md:text-lg sm:text-5xl text-7xl tracking-wide group-hover:text-highlight`}
        >
          {t(name as 'Validators')}
        </div>
      </div>
    </Link>
  );
};

export default NavigationBarItem;
