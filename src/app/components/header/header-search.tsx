'use client';

import Image from 'next/image';
import { FC } from 'react';

interface OwnProps {}

const HeaderSearch: FC<OwnProps> = ({}) => {
  return (
    <label className="-mt-6 flex h-6 flex-row items-center justify-center space-x-2">
      <Image src="/img/icons/search.svg" alt="search" width={16} height={16} className="h-4 w-4 cursor-text" />
      <input
        style={{ width: '1rem' }}
        className="w-min-0 max-w-[50vw] bg-transparent text-base text-highlight focus:outline-0 focus:ring-0"
        onChange={(e) => (e.target.style.width = (e.target.value.length || 1) * 0.6 + 'rem')}
      />
    </label>
  );
};

export default HeaderSearch;
