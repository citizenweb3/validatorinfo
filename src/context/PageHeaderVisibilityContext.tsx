'use client';

import { FC, ReactNode, createContext, useContext, useState } from 'react';

interface TabsVisibilityContextType {
  areTabsCollapsed: boolean;
  toggleTabsVisibility: () => void;
}

export const PageHeaderVisibilityContext = createContext<TabsVisibilityContextType | undefined>(undefined);

export const useTabsVisibility = () => {
  const context = useContext(PageHeaderVisibilityContext);
  if (!context) {
    throw new Error('useTabsVisibility must be used within TabsVisibilityProvider');
  }
  return context;
};

interface TabsVisibilityProviderProps {
  children: ReactNode;
}

export const TabsVisibilityProvider: FC<TabsVisibilityProviderProps> = ({ children }) => {
  const [areTabsCollapsed, setAreTabsCollapsed] = useState(false);

  const toggleTabsVisibility = () => {
    setAreTabsCollapsed((prev) => !prev);
  };

  return (
    <PageHeaderVisibilityContext.Provider value={{ areTabsCollapsed, toggleTabsVisibility }}>
      {children}
    </PageHeaderVisibilityContext.Provider>
  );
};
