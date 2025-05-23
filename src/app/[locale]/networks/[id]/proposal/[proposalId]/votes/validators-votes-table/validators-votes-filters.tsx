'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';
import Button from '@/components/common/button';

interface OwnProps {}

const votes = [
  { value: 'all', title: 'all' },
  { value: 'yes', title: 'yes' },
  { value: 'no', title: 'no' },
  { value: 'veto', title: 'veto' },
  { value: 'did_not_vote', title: 'did not vote' },
  { value: 'weighted', title: 'weighted' },
];

const ValidatorsVotesFilters: FC<OwnProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('ProposalPage');
  const searchParamsHook = useSearchParams();
  const selectedTagsFromUrl = searchParamsHook.getAll('vote');

  const onVotesChanged = (value: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('p', '1');
    searchParams.set('vote', value.toString());
    router.push(`${pathname}?${searchParams.toString()}`, { scroll: false});
  };

  return (
    <div className="flex items-center justify-center space-x-2 mb-12">
      {votes.map((item) => (
        <Button
          key={item.value}
          component="button"
          onClick={() => onVotesChanged(item.value)}
          isActive={selectedTagsFromUrl.indexOf(item.value) !== -1}
          className="text-base"
          contentClassName=""
          activeType="switcher"
        >
          <div className="-my-1 flex flex-row items-center justify-center text-base font-medium">
            {t(item.title as 'all')}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ValidatorsVotesFilters;
