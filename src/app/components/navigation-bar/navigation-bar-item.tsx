'use client';

import Image from 'next/image';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tab-list';

interface OwnProps {
  item: TabOptions;
}

const NavigationBarItem: FC<OwnProps> = ({ item: { name, icon } }) => {
  return (
    <div className="group flex cursor-pointer flex-row flex-nowrap items-center border-b border-l border-bgSt text-sm">
      <div className="h-full min-w-10 px-1.5 py-2.5 text-center">
        {icon && <Image src={icon} alt={name} width={26} height={26} className="w-8" />}
      </div>
      <div className="absolute left-14 text-nowrap group-hover:text-highlight">{name}</div>
    </div>
  );
};

export default NavigationBarItem;
