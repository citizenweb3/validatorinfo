'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';

interface OwnProps {}

const HeaderSearch: FC<OwnProps> = () => {
  const t = useTranslations('Header');

  return (
    <label className="-mt-6 flex h-6 flex-row items-center justify-center">
      <div className="relative flex">
        <input
          style={{ width: '1rem' }}
          className="w-min-0 peer max-w-[50vw] bg-transparent text-base text-highlight focus:outline-0 focus:ring-0"
          onChange={(e) => (e.target.style.width = (e.target.value.length || 1) * 0.6 + 'rem')}
        />
        <Tooltip className="text-nowrap" tooltip={t('Search for a validator, pool, tx, address, network, etc')}>
          <div
            className={`absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform cursor-text bg-search bg-contain peer-focus:hidden hover:bg-search_h`}
          />
        </Tooltip>
      </div>
    </label>
  );
};

export default HeaderSearch;
