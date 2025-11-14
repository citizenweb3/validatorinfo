'use client';

import { FC, ReactNode } from 'react';

import { TabsVisibilityProvider } from '@/context/PageHeaderVisibilityContext';

interface OwnProps {
  children: ReactNode;
}

const PageHeaderVisibilityWrapper: FC<OwnProps> = ({ children }) => {
  return <TabsVisibilityProvider>{children}</TabsVisibilityProvider>;
};

export default PageHeaderVisibilityWrapper;
