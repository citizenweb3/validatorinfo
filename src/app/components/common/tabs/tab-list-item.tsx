'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/main-tabs';

interface OwnProps {
  item: TabOptions;
}
const TabListItem: FC<OwnProps> = ({ item: { name, href, icon } }) => {
  const segment = useSelectedLayoutSegment();
  const isActive = `/${segment}` === href;
  return (
    <Link
      href={href}
      className={`${isActive && 'bg-gradient-to-b from-primary to-secondary'} group flex-grow cursor-pointer border-b border-l border-bgSt p-0.5 active:border-transparent`}
    >
      <div className="flex h-full flex-row flex-nowrap items-center justify-center bg-background px-2 py-1.5 text-lg group-hover:text-highlight">
        {icon && <Image src={icon} alt={name} width={26} height={26} className="mr-2 w-6" />}
        {name}
      </div>
    </Link>
  );
};

export default TabListItem;
