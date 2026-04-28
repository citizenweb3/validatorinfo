'use client';

import { FC, ReactNode, createContext, useCallback, useContext, useState } from 'react';

interface HeaderCollapsedContextType {
  isCollapsed: boolean;
  toggle: () => void;
}

const HeaderCollapsedContext = createContext<HeaderCollapsedContextType | undefined>(undefined);

export const useHeaderCollapsed = () => {
  const context = useContext(HeaderCollapsedContext);
  if (!context) {
    throw new Error('useHeaderCollapsed must be used within HeaderCollapsedProvider');
  }
  return context;
};

interface HeaderCollapsedProviderProps {
  children: ReactNode;
}

export const HeaderCollapsedProvider: FC<HeaderCollapsedProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <HeaderCollapsedContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </HeaderCollapsedContext.Provider>
  );
};
