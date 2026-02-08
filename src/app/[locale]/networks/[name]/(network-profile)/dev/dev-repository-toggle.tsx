'use client';

import { FC, ReactNode, useRef, useState } from 'react';

import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  distributionMapLabel: string;
  showLabel: string;
  hideLabel: string;
  children: ReactNode;
  table: ReactNode;
}

const DevRepositoryToggle: FC<OwnProps> = ({
  distributionMapLabel,
  showLabel,
  hideLabel,
  children,
  table,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!isOpened) {
      setIsOpened(true);
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    } else {
      setIsOpened(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-4">
        <RoundedButton contentClassName="text-lg">{distributionMapLabel}</RoundedButton>
        <RoundedButton onClick={handleToggle} contentClassName="text-lg px-9">
          <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
            <span className={isOpened ? 'invisible' : ''}>{showLabel}</span>
            <span className={isOpened ? '' : 'invisible'}>{hideLabel}</span>
          </span>
        </RoundedButton>
      </div>
      {children}
      {isOpened && <div ref={tableRef}>{table}</div>}
    </>
  );
};

export default DevRepositoryToggle;
