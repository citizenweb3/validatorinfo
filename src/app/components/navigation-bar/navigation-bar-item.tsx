'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';

interface OwnProps {
  item: TabOptions;
  isOpened: boolean;
}

const NavigationBarItem: FC<OwnProps> = ({ item: { name, href, icon, iconHovered }, isOpened }) => {
  const segment = useSelectedLayoutSegment();
  const isActive = `/${segment}` === href;

  return (
    <Link
      href={href}
      className={`${isOpened ? 'min-h-10 w-[15.5rem]' : 'h-10 w-10'} font-semibold !active:max-h-7 group relative flex cursor-pointer flex-row items-center overflow-hidden border-r border-t border-bgSt text-sm shadow-button transition-width duration-300 hover:bg-bgSt active:top-1 active:border-transparent active:bg-background active:shadow-none`}
    >
      <div className="absolute left-5 top-[1.15rem] -translate-x-1/2 -translate-y-1/2 transform">
        {icon && <Image src={icon} alt={name} width={28} height={28} priority className="min-w-7 max-w-7" />}
      </div>
      <div
        className={`${isActive ? 'block' : 'hidden group-hover:block'} absolute left-5 top-[1.15rem] -translate-x-1/2 -translate-y-1/2 transform`}
      >
        {iconHovered && (
          <Image src={iconHovered} alt={name} width={40} height={40} priority className="min-w-10 max-w-10" />
        )}
      </div>
      <div className={`${isActive && 'text-highlight'} ml-14 text-nowrap text-lg group-hover:text-highlight`}>
        {name}
      </div>
    </Link>
  );
};

export default NavigationBarItem;
