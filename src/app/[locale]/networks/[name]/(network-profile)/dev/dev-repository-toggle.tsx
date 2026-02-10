'use client';

import { FC, ReactNode, useRef, useState } from 'react';

import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  subtitleText: string;
  showLabel: string;
  hideLabel: string;
  children: ReactNode;
  table: ReactNode;
}

const DevRepositoryToggle: FC<OwnProps> = ({
  subtitleText,
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
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else {
      setIsOpened(false);
    }
  };

  return (
    <div className="mt-14">
      <div className="flex items-center justify-between">
        <h2 className="flex w-fit border-b border-bgSt pb-1 px-4 py-4 font-handjet text-xl text-highlight">
          {subtitleText}
        </h2>
        <RoundedButton onClick={handleToggle} contentClassName="text-lg px-9">
          <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
            <span className={isOpened ? 'invisible' : ''}>{showLabel}</span>
            <span className={isOpened ? '' : 'invisible'}>{hideLabel}</span>
          </span>
        </RoundedButton>
      </div>
      {children}
      {isOpened && <div ref={tableRef}>{table}</div>}
    </div>
  );
};

export default DevRepositoryToggle;
