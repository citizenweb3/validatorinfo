'use client';

import { FC, ReactNode, useContext } from 'react';

import { PageHeaderVisibilityContext } from '@/context/PageHeaderVisibilityContext';

interface OwnProps {
  children: ReactNode;
}

const CollapsePageHeader: FC<OwnProps> = ({ children }) => {
  const tabsContext = useContext(PageHeaderVisibilityContext);
  const areTabsCollapsed = tabsContext?.areTabsCollapsed || false;

  return (
    <div
      className={`transition-all duration-300 ${
        areTabsCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[2000px] opacity-100'
      }`}
    >
      {children}
    </div>
  );
};

export default CollapsePageHeader;
