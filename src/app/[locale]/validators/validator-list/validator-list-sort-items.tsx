'use client';

import { FC, useState } from 'react';

import SortButton from '@/components/common/sort-button';

interface OwnProps {}

const ValidatorListSortItems: FC<OwnProps> = () => {
  const [direction, setDirection] = useState<'t' | 'b'>('b');
  return (
    <div className="flex flex-col items-center justify-center">
      <SortButton direction={direction} onClick={() => setDirection(direction === 't' ? 'b' : 't')} />
    </div>
  );
};

export default ValidatorListSortItems;
