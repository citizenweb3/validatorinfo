import { StaticImageData } from 'next/image';
import { FC } from 'react';

import TabListItem from '@/components/common/tabs/tab-list-item';

export interface TabOptions {
  name: string;
  href: string;
  icon?: StaticImageData;
  isSelected?: boolean;
}

interface OwnProps {
  list: TabOptions[];
}

const TabList: FC<OwnProps> = ({ list }) => {
  return (
    <div className="flex flex-row space-x-6">
      {list.map((item) => (
        <TabListItem key={item.href} item={item} />
      ))}
    </div>
  );
};

export default TabList;
