'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import Button from '@/components/common/button';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
}

const tags = [
  { value: 'tag1', title: 'Tag1' },
  { value: 'tag2', title: 'Tag2' },
  { value: 'tag3', title: 'Tag3' },
];

const LibraryTagsFilter: FC<OwnProps> = ({}) => {
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

  const onTagsChanged = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    const currentTags = searchParams.getAll('tags');
    const newTags = currentTags.includes(value)
      ? currentTags.filter((tag) => tag !== value)
      : [...currentTags, value];
    searchParams.delete('tags');
    newTags.forEach((tag) => searchParams.append('tags', tag));
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="flex h-6 mt-5 items-center justify-start">
      <div className="flex flex-row items-center mr-1">
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
      {isOpened && (
        <>
          {tags.map((item) => (
            <Button
              key={item.value}
              component="button"
              onClick={() => onTagsChanged(item.value)}
              isActive={selectedTagsFromUrl.indexOf(item.value) !== -1}
              className="text-base mx-2"
              contentClassName=""
              activeType="switcher"
            >
              <div className="-my-1 px-10 flex flex-row items-center justify-center text-base font-medium">
                {item.title}
              </div>
            </Button>
          ))}
        </>
      )}
    </div>
  );
};

export default LibraryTagsFilter;
