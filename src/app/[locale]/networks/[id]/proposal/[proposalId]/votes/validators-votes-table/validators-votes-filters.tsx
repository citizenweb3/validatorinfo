'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';
import Button from '@/components/common/button';

interface OwnProps {
  selectedVotesFilters?: string[];
}

const votes = [
  { value: 'all', title: 'all' },
  { value: 'yes', title: 'yes' },
  { value: 'no', title: 'no' },
  { value: 'veto', title: 'veto' },
  { value: 'not_voted', title: 'did not vote' },
  { value: 'weighted', title: 'weighted' },
];

const ValidatorsVotesFilters: FC<OwnProps> = ({ selectedVotesFilters = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('ProposalPage');
  const searchParamsHook = useSearchParams();
  const selectedTagsFromUrl = searchParamsHook.getAll('vote');

  const onVotesChanged = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    const currentVotes = searchParams.getAll('vote');
    const newVotes = currentVotes.includes(value)
      ? currentVotes.filter((vote) => vote !== value)
      : [...currentVotes, value];
    searchParams.delete('vote');
    newVotes.forEach((vote) => searchParams.append('vote', vote));
    searchParams.set('p', '1');
    router.push(`${pathname}?${searchParams.toString()}`);
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
            {t(item.title as 'yes')}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ValidatorsVotesFilters;
