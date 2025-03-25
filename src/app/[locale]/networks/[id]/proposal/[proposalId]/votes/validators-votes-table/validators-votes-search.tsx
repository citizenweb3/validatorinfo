'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/common/tooltip';
import { useTranslations } from 'next-intl';

const ValidatorsVotesSearch: FC = () => {
  const t = useTranslations('ProposalPage');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    newParams.set('search', search);
    router.push(`?${newParams.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <label className="-mt-6 flex h-6 flex-row">
      <div className="relative flex">
        <Tooltip noWrap tooltip={t('Search by validator name and tx hash')}>
          <div className={`h-6 w-6 cursor-text bg-search bg-contain peer-focus:hidden hover:bg-search_h`} />
        </Tooltip>
        <div>
          <input
            value={search}
            className="ml-2 w-full peer bg-transparent text-base text-highlight focus:outline-0 focus:ring-0"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </label>
  );
};

export default ValidatorsVotesSearch;
