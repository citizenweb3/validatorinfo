'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';

interface OwnProps {}

const HeaderSearch: FC<OwnProps> = () => {
  const t = useTranslations('Header');

  return (
    <label className="-mt-6 ml-4 flex h-6 flex-row items-center justify-center">
      <div className="relative flex">
        <Tooltip className="text-nowrap" tooltip={t('Search for a validator, pool, tx, address, network, etc')}>
          <div className={`h-6 w-6 cursor-text bg-search bg-contain peer-focus:hidden hover:bg-search_h`} />
        </Tooltip>
        <input
          style={{ width: '1rem' }}
          className="w-min-0 peer max-w-[50vw] bg-transparent text-base text-highlight focus:outline-0 focus:ring-0"
          onChange={(e) => (e.target.style.width = (e.target.value.length || 1) * 0.6 + 'rem')}
        />
      </div>
    </label>
  );
};

export default HeaderSearch;
