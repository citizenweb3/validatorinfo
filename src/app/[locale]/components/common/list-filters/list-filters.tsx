'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import ValidatorListFiltersBattery from '@/components/common/list-filters/validator-list-filters-battery';
import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  selectedEcosystems?: string[];
  perPage: number;
  battery?: boolean;
}

const ecosystems = [
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'polkadot', title: 'Polkadot' },
  { value: 'ethereum', title: 'Ethereum' },
  { value: 'near', title: 'Near' },
  { value: 'avalanche', title: 'Avalanche' },
  { value: 'pow', title: 'POW' },
];

const ListFilters: FC<OwnProps> = ({ perPage, selectedEcosystems = [], battery = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [resetClicks, setResetClicks] = useState<number>(0);
  const t = useTranslations('HomePage.Table');

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
  }, [router, resetClicks]);

  const onCustomiseClick = () => {
    setIsOpened(!isOpened);
    setResetClicks(resetClicks + 1);
  };

  const onPerPageChanged = (pp: number) => {
    const newSp = new URL(location.href).searchParams;
    newSp.set('pp', pp.toString());
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onChainsChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('selectedEcosystems');
    const chainParam =
      selectedEcosystems.indexOf(value) === -1
        ? [...selectedEcosystems, value]
        : selectedEcosystems.filter((c) => c !== value);
    chainParam.forEach((c) => newSp.append('selectedEcosystems', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div className="flex h-9 items-center justify-end space-x-2">
      {isOpened && (
        <>
          {battery && <ValidatorListFiltersBattery />}
          <ValidatorListFiltersPorPage onChange={onPerPageChanged} value={perPage} />
          {ecosystems.map((item) => (
            <Button
              component="button"
              onClick={() => onChainsChanged(item.value)}
              key={item.value}
              isActive={selectedEcosystems.indexOf(item.value) !== -1}
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

export default ListFilters;
