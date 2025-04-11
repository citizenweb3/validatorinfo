'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  selectedTags: string[];
}

const tagsFilters = [
  { value: 'tag1', title: 'Tag1' },
  { value: 'tag2', title: 'Tag2' },
  { value: 'tag3', title: 'Tag3' },
];

const LibraryTagsFilter: FC<OwnProps> = ({ selectedTags }) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('HomePage.Table');
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
    const newSp = new URL(location.href).searchParams;
    newSp.delete('tags');
    const tagsParam =
      selectedTags.indexOf(value) === -1 ? [...selectedTags, value] : selectedTags.filter((c) => c !== value);
    tagsParam.forEach((c) => newSp.append('tags', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div className="flex h-6 items-center justify-start">
      <div className="mr-1 flex flex-row items-center">
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
          {tagsFilters.map((item) => (
            <Button
              key={item.value}
              component="button"
              onClick={() => onTagsChanged(item.value)}
              isActive={selectedTags.indexOf(item.value) !== -1}
              className="mx-2 text-base"
              contentClassName=""
              activeType="switcher"
            >
              <div className="-my-1 flex flex-row items-center justify-center px-10 text-base font-medium">
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
