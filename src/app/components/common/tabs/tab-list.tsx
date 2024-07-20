import { FC } from 'react';

import TabListItem from '@/components/common/tabs/tab-list-item';
import { TabOptions } from '@/components/common/tabs/tabs-data';

interface OwnProps {
  tabs: TabOptions[];
}

const TabList: FC<OwnProps> = ({ tabs }) => {
  return (
    <div className="mb-6 flex flex-row space-x-4">
      {tabs.map((item) => (
        <TabListItem key={item.href} item={item} />
      ))}
    </div>
  );
};

export default TabList;
