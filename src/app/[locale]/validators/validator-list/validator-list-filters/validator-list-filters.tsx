'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import ValidatorListFiltersPorPage from '@/app/validators/validator-list/validator-list-filters/validator-list-filters-perpage';
import Button from '@/components/common/button';
import PlusButton from '@/components/common/plus-button';

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
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [perPage, setPerPage] = useState(25);
  const t = useTranslations('HomePage.Table');
  return (
    <div className="flex h-9 items-center justify-end space-x-2">
      {isOpened && (
        <>
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
            >
              <div className="z-20 -my-1 flex flex-row items-center justify-center text-base font-medium">
                {item.title}
              </div>
            </Button>
          ))}
          <ValidatorListFiltersPorPage />
        </>
      )}
      <div className="flex flex-row items-center">
        <Button onClick={() => setIsOpened(!isOpened)} isActive={isOpened}>
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
