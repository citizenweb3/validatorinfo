import { FC } from 'react';

import mainTabs from '@/components/common/tabs/main-tabs';
import TabListItem from '@/components/common/tabs/tab-list-item';

interface OwnProps {}

const TabList: FC<OwnProps> = () => {
  return (
    <div className="flex flex-row space-x-6">
      {mainTabs.map((item) => (
        <TabListItem key={item.href} item={item} />
      ))}
    </div>
  );
};

export default TabList;
