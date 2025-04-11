'use client';

import { FC, useState } from 'react';

import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  text: string;
  plusClassName?: string;
  contentClassName?: string;
}

const SubDescription: FC<OwnProps> = ({ text, plusClassName = '', contentClassName = '' }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  return (
    <div>
      <div className={`${isOpened || 'hidden'} ${contentClassName} whitespace-pre-line text-base`}>{text}</div>
      <div className={`${plusClassName} flex items-center justify-center`}>
        <PlusButton isOpened={isOpened} onClick={() => setIsOpened(!isOpened)} />
      </div>
    </div>
  );
};

export default SubDescription;
