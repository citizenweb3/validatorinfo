import { FC } from 'react';

import TabListItem from '@/components/common/tabs/tab-list-item';
import { TabOptions } from '@/components/common/tabs/tabs-data';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  tabs: TabOptions[];
}

const TabList: FC<OwnProps> = ({ page, tabs }) => {
  return (
    <div className="mb-3 flex flex-row space-x-4 font-handjet">
      {tabs.map((item) => (
        <TabListItem page={page} key={item.href} item={item} />
      ))}
    </div>
  );
};

export default TabList;
