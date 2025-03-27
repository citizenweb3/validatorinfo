'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import Button from '@/components/common/button';
import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';
import PlusButton from '@/components/common/plus-button';
import EcosystemListFilterTvl from '@/app/ecosystems/ecosystems-list/ecosystems-list-filters-tvl';
import EcosystemListFiltersTags from '@/app/ecosystems/ecosystems-list/ecosystems-list-filters-tags';

interface OwnProps {
  perPage: number;
}

const tags = [
  { value: 'tag1', title: 'Tag1' },
  { value: 'tag2', title: 'Tag2' },
  { value: 'tag3', title: 'Tag3' },
];

const ListFilters: FC<OwnProps> = ({ perPage }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();
  const t = useTranslations('HomePage.Table');
  const selectedTagsFromUrl = searchParamsHook.getAll('tags');
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [resetClicks, setResetClicks] = useState<number>(0);

  useEffect(() => {
    if (resetClicks >= 3) {
      router.push(`${pathname}`);
      setIsOpened(false);
    }
    const tm = setTimeout(() => {
      setResetClicks(0);
    }, 1000);

    return () => {
      clearTimeout(tm);
    };
  }, [router, resetClicks, pathname]);

  const onCustomiseClick = () => {
    setIsOpened(!isOpened);
    setResetClicks(resetClicks + 1);
  };

  const onPerPageChanged = (pp: number) => {
    const newSp = new URLSearchParams(location.search);
    newSp.set('pp', pp.toString());
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onTagsChanged = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    const currentTags = searchParams.getAll('tags');
    const newTags = currentTags.includes(value)
      ? currentTags.filter((tag) => tag !== value)
      : [...currentTags, value];
    searchParams.delete('tags');
    newTags.forEach((tag) => searchParams.append('tags', tag));
    searchParams.set('p', '1');
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="flex h-6 items-center justify-end">
      {isOpened && (
        <>
          <EcosystemListFilterTvl />
          <ValidatorListFiltersPorPage onChange={onPerPageChanged} value={perPage} />
          <EcosystemListFiltersTags
            filterValues={tags}
            selectedValue={selectedTagsFromUrl}
            onChanged={onTagsChanged}
          />
        </>
      )}
      <div className="flex flex-row items-center">
        <Button
          activeType="switcher"
          onClick={onCustomiseClick}
          isActive={isOpened}
          tooltip={t('Click 3 times to reset all filters')}
        >
          <div className="z-20 -my-1 flex flex-row items-center justify-center py-px text-base font-medium">
            <div>{t('Customize')}</div>
            <PlusButton size="sm" isOpened={isOpened} />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default ListFilters;
