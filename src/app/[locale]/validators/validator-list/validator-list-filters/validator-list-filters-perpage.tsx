'use client';

import { FC, useState } from 'react';

import Button from '@/components/common/button';

const ValidatorListFiltersPorPage: FC = () => {
  const [perPage, setPerPage] = useState(25);
  return (
    <div className="border-r border-t border-bgSt px-2 py-0.5 text-base shadow-button">
      <div className="flex min-w-9 flex-row items-center space-x-2 py-px">
        <div>Rows:</div>
        <Button
          isActive={perPage === 25}
          onClick={() => setPerPage(25)}
          contentClassName="py-0 px-2 max-h-4 text-base font-hackernoon hover:text-highlight"
        >
          25
        </Button>
        <Button
          isActive={perPage === 50}
          onClick={() => setPerPage(50)}
          contentClassName="py-0 px-2 max-h-4 text-base font-hackernoon"
        >
          50
        </Button>
        <Button
          isActive={perPage === 100}
          onClick={() => setPerPage(100)}
          contentClassName="py-0 px-2 max-h-4 text-base font-hackernoon"
        >
          100
        </Button>
      </div>
    </div>
  );
};

export default ValidatorListFiltersPorPage;
