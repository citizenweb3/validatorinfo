'use client';

import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface ProposalTextContextValue {
  isExpanded: boolean;
  toggle: () => void;
}

const ProposalTextContext = createContext<ProposalTextContextValue>({
  isExpanded: false,
  toggle: () => {},
});

export const ProposalTextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = () => setIsExpanded((prev) => !prev);

  return <ProposalTextContext.Provider value={{ isExpanded, toggle }}>{children}</ProposalTextContext.Provider>;
};

export const useProposalText = () => useContext(ProposalTextContext);
