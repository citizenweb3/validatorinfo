'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';

interface OwnProps {
  item: TabOptions;
}

const NavigationBarItem: FC<OwnProps> = ({ item: { name, href, icon, iconHovered } }) => {
  const segment = useSelectedLayoutSegment();
  const isActive = `/${segment}` === href;

  return (
    <Link
      href={href}
      className="group relative flex min-h-14 min-w-10 cursor-pointer flex-row items-center border-b border-l border-bgSt text-sm"
    >
      <div className="absolute left-6 top-7 -translate-x-1/2 -translate-y-1/2 transform">
        {icon && <Image src={icon} alt={name} width={26} height={26} className="w-8" />}
      </div>
      <div
        className={`${isActive ? 'block' : 'hidden group-hover:block'} absolute left-6 top-7 -translate-x-1/2 -translate-y-1/2 transform`}
      >
        {iconHovered && <Image src={iconHovered} alt={name} width={46} height={46} className="w-14" />}
      </div>
      <div className={`${isActive && 'text-highlight'} ml-14 text-nowrap group-hover:text-highlight`}>{name}</div>
    </Link>
  );
};

export default NavigationBarItem;
