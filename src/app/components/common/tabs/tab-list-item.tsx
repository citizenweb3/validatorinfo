import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import { TabOptions } from '@/components/common/tabs/tab-list';

const TabListItem: FC<{ item: TabOptions }> = ({ item: { name, href, isSelected, icon } }) => {
  return (
    <Link
      href={href}
      className={`${isSelected && 'bg-gradient-to-b from-primary to-secondary'} active:border-transparent group flex-grow cursor-pointer border-b border-l border-bgSt p-0.5`}
    >
      <div className="flex h-full flex-row flex-nowrap items-center justify-center bg-background px-2 py-1.5 text-lg group-hover:text-highlight">
        {icon && <Image src={icon} alt={name} width={26} height={26} className="mr-2 w-6" />}
        {name}
      </div>
    </Link>
  );
};

export default TabListItem;
