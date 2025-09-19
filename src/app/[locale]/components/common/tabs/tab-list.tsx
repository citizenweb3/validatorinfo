'use client';

import { FC, useCallback, useState } from 'react';

import TabListItem from '@/components/common/tabs/tab-list-item';
import { TabOptions } from '@/components/common/tabs/tabs-data';
import { useWindowEvent } from '@/hooks/useWindowEvent';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  tabs: TabOptions[];
}

const TabList: FC<OwnProps> = ({ page, tabs }) => {
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);

  const onSectionHover = useCallback((detail: string | null) => {
    setHoverTarget(detail);
  }, []);

  useWindowEvent<string | null>('section:hover', onSectionHover);

  const highlight = hoverTarget === 'tabs' ? 'outline outline-2 outline-dottedLine outline-offset-2' : 'outline-0';

  return (
    <div className={`mr-6 flex flex-row space-x-12 pb-1 font-handjet sm:space-x-10 md:space-x-4 ${highlight}`}>
      {tabs.map((item) => (
        <TabListItem page={page} key={item.href} item={item} />
      ))}
    </div>
  );
};

export default TabList;
