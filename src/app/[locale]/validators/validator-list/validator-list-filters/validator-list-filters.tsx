'use client';

import { useTranslations } from 'next-intl';
import { FC, useEffect, useState } from 'react';

import ValidatorListFiltersBattery from '@/app/validators/validator-list/validator-list-filters/validator-list-filters-battery';
import ValidatorListFiltersPorPage from '@/app/validators/validator-list/validator-list-filters/validator-list-filters-perpage';
import Button from '@/components/common/button';
import PlusButton from '@/components/common/plus-button';
import { useRouter } from '@/i18n';

interface OwnProps {
  chains: string[];
}

const filterItems = [
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'polkadot', title: 'Polkadot' },
  { value: 'ethereum', title: 'Ethereum' },
  { value: 'near', title: 'Near' },
  { value: 'avalanche', title: 'Avalanche' },
  { value: 'pow', title: 'POW' },
];

const ValidatorListFilters: FC<OwnProps> = ({ chains = [] }) => {
  const router = useRouter();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [resetClicks, setResetClicks] = useState<number>(0);
  const t = useTranslations('HomePage.Table');

  useEffect(() => {
    if (resetClicks >= 3) {
      router.push('/validators');
      setIsOpened(false);
    }
    const tm = setTimeout(() => {
      setResetClicks(0);
    }, 1000);

    return () => {
      clearTimeout(tm);
    };
  }, [router, resetClicks]);

  const onCustomiseClick = () => {
    setIsOpened(!isOpened);
    setResetClicks(resetClicks + 1);
  };

  return (
    <div className="flex h-9 items-center justify-end space-x-2">
      {isOpened && (
        <>
          <ValidatorListFiltersBattery />
          <ValidatorListFiltersPorPage />
          {filterItems.map((item) => (
            <Button
              component="link"
              href={{
                pathname: '/validators',
                query: {
                  chains:
                    chains.indexOf(item.value) === -1
                      ? [...chains, item.value]
                      : chains.filter((c) => c !== item.value),
                },
              }}
              key={item.value}
              isActive={chains.indexOf(item.value) !== -1}
              className="text-sm"
              contentClassName="max-h-7"
              activeType="switcher"
            >
              <div className="z-20 -my-1 flex flex-row items-center justify-center text-base font-medium">
                {item.title}
              </div>
            </Button>
          ))}
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

export default ValidatorListFilters;
