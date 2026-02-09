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
  highlighted?: boolean;
}

const NavigationBarItem: FC<OwnProps> = ({ item: { name, href, icon, iconHovered }, isOpened, highlighted }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const t = useTranslations('Navbar');

  const isHighlighted = isActive || highlighted;

  return (
    <Link
      href={href}
      data-active={isHighlighted ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={`${
        isOpened ? 'min-h-44 sm:min-h-24 md:h-10 md:min-h-10 md:w-[15.5rem]' : 'h-10 w-10'
      } ${
        isHighlighted
          ? 'border border-[#3e3e3e] text-highlight'
          : 'bg-gradient-to-t from-[#181818] from-[26%] to-[rgba(62,62,62,0.3)] border-r border-t border-bgSt'
      } group relative flex cursor-pointer flex-col items-center overflow-hidden p-px text-sm shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black] transition-width duration-300 hover:bg-bgHover hover:text-highlight active:translate-y-1 active:border-transparent active:bg-background active:shadow-none`}
    >
      <div
        className="relative flex h-full w-full flex-grow flex-row flex-nowrap items-center overflow-hidden text-base font-semibold group-hover:text-highlight"
      >
        <div className="absolute md:left-5 md:top-[1.15rem] md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
          {icon && (
            <Image
              src={icon}
              alt={name}
              width={120}
              height={120}
              priority
              className="min-w-32 max-w-32 sm:min-w-16 sm:max-w-16 md:min-w-10 md:max-w-10"
            />
          )}
        </div>
        <div
          className={`${
            isActive ? 'block' : 'hidden group-hover:block'
          } absolute md:left-5 md:top-[1.15rem] md:-translate-x-1/2 md:-translate-y-1/2 md:transform`}
        >
          {iconHovered && (
            <Image
              src={iconHovered}
              alt={name}
              width={120}
              height={120}
              priority
              className="min-w-32 max-w-32 sm:min-w-16 sm:max-w-16 md:min-w-10 md:max-w-10"
            />
          )}
        </div>
        <div
          className={`${
            isHighlighted ? 'text-highlight' : ''
          } ml-36 text-nowrap font-handjet text-7xl tracking-wide group-hover:text-highlight sm:ml-20 sm:text-5xl md:ml-14 md:text-lg`}
        >
          {t(name as 'Validators')}
        </div>
      </div>
    </Link>
  );
};

export default NavigationBarItem;
