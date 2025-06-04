'use client';

import { FC } from 'react';

import Button from '@/components/common/button';

interface OwnProps {
  onChange: (pp: number) => void;
  value: number;
}

const ValidatorListFiltersPorPage: FC<OwnProps> = ({ value, onChange }) => (
  <div className="md:text-lg text-7xl">
    <div className="flex min-w-9 flex-row items-center md:space-x-2 space-x-6 py-px">
      <div>Rows:</div>
        <Button
          isActive={value === 25}
          onClick={() => onChange(25)}
          contentClassName="py-0 px-2 md:max-h-4 max-h-32 mx-10 md:mx-0 md:text-lg text-7xl font-handjet hover:text-highlight"
          activeType="switcher"
        >
          25
        </Button>
      <Button
        isActive={value === 50}
        onClick={() => onChange(50)}
        contentClassName="py-0 px-2 md:max-h-4 max-h-32 mx-10 md:mx-0 md:text-lg text-7xl font-handjet hover:text-highlight"
        activeType="switcher"
      >
        50
      </Button>
      <Button
        isActive={value === 100}
        onClick={() => onChange(100)}
        contentClassName="py-0 px-2 md:max-h-4 max-h-32 mx-10 md:mx-0 md:text-lg text-7xl font-handjet hover:text-highlight"
        activeType="switcher"
      >
        100
      </Button>
    </div>
  </div>
);

export default ValidatorListFiltersPorPage;
