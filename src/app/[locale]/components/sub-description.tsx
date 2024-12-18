'use client';

import { FC, useState } from 'react';

import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  text: string;
}

const SubDescription: FC<OwnProps> = ({ text }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  return (
    <div className="m-4">
      <div className={`${isOpened || 'hidden'} whitespace-pre-line text-base`}>{text}</div>
      <div className="flex items-center justify-center">
        <PlusButton isOpened={isOpened} onClick={() => setIsOpened(!isOpened)} />
      </div>
    </div>
  );
};

export default SubDescription;
