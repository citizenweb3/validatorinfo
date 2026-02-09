'use client';

import { FC, useCallback, useContext, useState } from 'react';

import Button from '@/components/common/button';
import TabListItem from '@/components/common/tabs/tab-list-item';
import { TabOptions } from '@/components/common/tabs/tabs-data';
import { useWindowEvent } from '@/hooks/useWindowEvent';
import { PagesProps } from '@/types';
import { PageHeaderVisibilityContext } from '@/context/PageHeaderVisibilityContext';

interface OwnProps extends PagesProps {
  tabs: TabOptions[];
}

const TabList: FC<OwnProps> = ({ page, tabs }) => {
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const tabsContext = useContext(PageHeaderVisibilityContext);

  const onSectionHover = useCallback((detail: string | null) => {
    setHoverTarget(detail);
  }, []);

  useWindowEvent<string | null>('section:hover', onSectionHover);

  const highlight = hoverTarget === 'tabs' ? 'outline outline-2 outline-dottedLine outline-offset-2' : 'outline-0';

  return (
    <div className={`relative mr-6 flex flex-row space-x-12 pb-1 font-handjet sm:space-x-10 md:space-x-4 ${highlight}`}>
      {tabs.map((item) => (
        <TabListItem page={page} key={item.href} item={item} />
      ))}
      {tabsContext && (
        <Button
          onClick={tabsContext.toggleTabsVisibility}
          className="group/toggle absolute -right-8 top-[calc(50%-2px)] hidden h-10 w-7 !min-w-6 !-translate-y-1/2 md:block"
          contentClassName="!p-0"
        >
          <div className="relative h-8 w-5">
            <div
              className={`absolute left-1/2 top-1/2 min-h-5 min-w-7 -translate-x-1/2 -translate-y-1/2 transform bg-hide bg-contain bg-no-repeat transition-transform duration-300 group-hover/toggle:bg-hide_h group-active/toggle:bg-hide_a ${
                tabsContext.areTabsCollapsed ? '-rotate-90' : 'rotate-90'
              }`}
            />
          </div>
        </Button>
      )}
    </div>
  );
};

export default TabList;
