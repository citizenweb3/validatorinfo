'use client';

import { FC, ReactNode, useState } from 'react';

import PlusButton from '@/components/common/plus-button';
import { cn } from '@/utils/cn';

interface OwnProps {
  children: ReactNode;
  description: string;
}

const CollapsiblePageHeader: FC<OwnProps> = ({ children, description }) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <>
      <div className="flex flex-row items-end gap-1">
        {children}
        <PlusButton size="sm" isOpened={isOpened} onClick={() => setIsOpened(!isOpened)} />
      </div>
      <div className={cn('whitespace-pre-line text-base m-4', !isOpened && 'hidden')}>
        {description}
      </div>
    </>
  );
};

export default CollapsiblePageHeader;
