'use client';

import { FC } from 'react';

import Button from '@/components/common/button';

interface OwnProps {
  onChange: (pp: number) => void;
  value: number;
}

const ValidatorListFiltersPorPage: FC<OwnProps> = ({ value, onChange }) => (
  <div className="text-lg">
    <div className="flex min-w-9 flex-row items-center space-x-2 py-px">
      <div>Rows:</div>
      <Button
        isActive={value === 25}
        onClick={() => onChange(25)}
        contentClassName="py-0 px-2 max-h-4 text-lg font-handjet hover:text-highlight"
        activeType="switcher"
      >
        25
      </Button>
      <Button
        isActive={value === 50}
        onClick={() => onChange(50)}
        contentClassName="py-0 px-2 max-h-4 text-lg font-handjet"
        activeType="switcher"
      >
        50
      </Button>
      <Button
        isActive={value === 100}
        onClick={() => onChange(100)}
        contentClassName="py-0 px-2 max-h-4 text-lg font-handjet"
        activeType="switcher"
      >
        100
      </Button>
    </div>
  </div>
);

export default ValidatorListFiltersPorPage;
