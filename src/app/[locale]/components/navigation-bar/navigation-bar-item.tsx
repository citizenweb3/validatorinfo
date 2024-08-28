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
      className={`${isActive ? 'border-none bg-gradient-to-r from-primary to-secondary' : 'border-r border-t border-bgSt'} ${isOpened ? 'min-h-10 w-[15.5rem]' : 'h-10 w-10 hover:border-highlight'} !active:max-h-7 group relative flex cursor-pointer flex-col items-center overflow-hidden p-px text-sm shadow-button transition-width duration-300 hover:bg-bgHover active:top-1 active:border-transparent active:bg-background active:shadow-none`}
    >
      <div className="relative flex h-full w-full flex-grow flex-row flex-nowrap items-center overflow-hidden bg-background text-base font-semibold group-hover:text-highlight hover:bg-bgHover active:bg-background">
        <div className="absolute left-5 top-[1.15rem] -translate-x-1/2 -translate-y-1/2 transform">
          {icon && <Image src={icon} alt={name} width={120} height={120} priority className="min-w-10 max-w-10" />}
        </div>
        <div
          className={`${isActive ? 'block' : 'hidden group-hover:block'} absolute left-5 top-[1.15rem] -translate-x-1/2 -translate-y-1/2 transform`}
        >
          {iconHovered && (
            <Image src={iconHovered} alt={name} width={120} height={120} priority className="min-w-10 max-w-10" />
          )}
        </div>
        <div
          className={`${isActive && 'text-highlight'} ml-14 text-nowrap text-base uppercase group-hover:text-highlight`}
        >
          {t(name as 'Validators')}
        </div>
      </div>
    </Link>
  );
};

export default NavigationBarItem;
