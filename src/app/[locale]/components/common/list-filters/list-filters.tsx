'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import Dropdown from '@/components/common/list-filters/dropdown';
import ValidatorListFiltersBattery from '@/components/common/list-filters/validator-list-filters-battery';
import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  selectedEcosystems?: string[];
  perPage: number;
  battery?: boolean;
}

export const ecosystemsDropdown = [
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'namada', title: 'Namada' },
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
    newSp.delete('ecosystems');
    const chainParam =
      selectedEcosystems.indexOf(value) === -1
        ? [...selectedEcosystems, value]
        : selectedEcosystems.filter((c) => c !== value);
    newSp.set('p', '1');
    chainParam.forEach((c) => newSp.append('ecosystems', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div className="flex h-8 items-center justify-end space-x-10">
      {isOpened && (
        <>
          <Dropdown
            filterValues={ecosystemsDropdown}
            title={t('Ecosystems')}
            selectedValue={selectedEcosystems}
            onChanged={onChainsChanged}
          />
          <ValidatorListFiltersPorPage onChange={onPerPageChanged} value={perPage} />
          {battery && <ValidatorListFiltersBattery />}
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
