'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import ValidatorListFiltersPorPage from '@/app/main-validators/validator-list/validator-list-filters/validator-list-filters-perpage';
import Button from '@/components/common/button';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  chains?: string[];
  perPage: number;
}

const filterItems = [
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'polkadot', title: 'Polkadot' },
  { value: 'ethereum', title: 'Ethereum' },
  { value: 'near', title: 'Near' },
  { value: 'avalanche', title: 'Avalanche' },
  { value: 'pow', title: 'POW' },
];

const NetworksListFilters: FC<OwnProps> = ({ perPage, chains = [] }) => {
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

  const onPerPageChanged = (pp: number) => {
    const chainParam = chains.length ? `&chains=${chains.join('&chains=')}` : '';
    router.push(`/networks/?pp=${pp}${chainParam}`);
  };

  const onChainsChanged = (value: string) => {
    const chainParam = chains.indexOf(value) === -1 ? [...chains, value] : chains.filter((c) => c !== value);
    router.push(`/networks/?pp=${perPage}&chains=${chainParam.join('&chains=')}`);
  };

  return (
    <div className="flex h-9 items-center justify-end space-x-2">
      {isOpened && (
        <>
          <ValidatorListFiltersPorPage onChange={onPerPageChanged} value={perPage} />
          {filterItems.map((item) => (
            <Button
              component="button"
              onClick={() => onChainsChanged(item.value)}
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

export default NetworksListFilters;
