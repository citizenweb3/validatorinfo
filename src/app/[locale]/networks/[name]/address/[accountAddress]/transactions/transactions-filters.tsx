'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import Dropdown from '@/components/common/list-filters/dropdown';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {}

const typeFilterValues = [
  { value: 'send', title: 'Send' },
  { value: 'unjail', title: 'Unjail' },
  { value: 'claim_rewards', title: 'Claim Rewards' },
  { value: 'all', title: 'All' },
];

const dateFilterValues = [
  { value: '24h', title: 'Last 24h' },
  { value: '7d', title: 'Last 7 days' },
  { value: '30d', title: 'Last 30 days' },
  { value: '1y', title: 'Last year' },
  { value: 'all', title: 'All' },
];

const amountFilterValues = [
  { value: 'lt1', title: '< 1' },
  { value: '1-10', title: '1-10' },
  { value: '10-100', title: '10-100' },
  { value: '100+', title: '100+' },
  { value: 'all', title: 'All' },
];

const checkHasActiveFilters = (searchParams: ReturnType<typeof useSearchParams>): boolean => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('p');
  params.delete('pp');
  params.delete('sortBy');
  params.delete('order');

  return params.toString().length > 0;
};

const TransactionsFilters: FC<OwnProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [resetClicks, setResetClicks] = useState<number>(0);
  const t = useTranslations('AccountPage.Transactions');

  const hasActiveFilters = checkHasActiveFilters(searchParams);

  const selectedType = searchParams.getAll('tx_type');
  const selectedDate = searchParams.getAll('date_range');
  const selectedAmount = searchParams.getAll('amount_range');

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

  const handleCustomizeClick = () => {
    setIsOpened(!isOpened);
    setResetClicks(resetClicks + 1);
  };

  const handleTypeChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('tx_type');
    const typeParam =
      selectedType.indexOf(value) === -1
        ? [...selectedType, value]
        : selectedType.filter((c) => c !== value);
    newSp.set('p', '1');
    typeParam.forEach((c) => newSp.append('tx_type', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const handleDateChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('date_range');
    const dateParam =
      selectedDate.indexOf(value) === -1
        ? [...selectedDate, value]
        : selectedDate.filter((c) => c !== value);
    newSp.set('p', '1');
    dateParam.forEach((c) => newSp.append('date_range', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const handleAmountChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('amount_range');
    const amountParam =
      selectedAmount.indexOf(value) === -1
        ? [...selectedAmount, value]
        : selectedAmount.filter((c) => c !== value);
    newSp.set('p', '1');
    amountParam.forEach((c) => newSp.append('amount_range', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div className="flex h-8 items-center justify-end space-x-10">
      {isOpened && (
        <>
          <Dropdown
            filterValues={typeFilterValues}
            title={t('filter-type')}
            selectedValue={selectedType}
            onChanged={handleTypeChanged}
          />
          <Dropdown
            filterValues={dateFilterValues}
            title={t('filter-date')}
            selectedValue={selectedDate}
            onChanged={handleDateChanged}
          />
          <Dropdown
            filterValues={amountFilterValues}
            title={t('filter-amount')}
            selectedValue={selectedAmount}
            onChanged={handleAmountChanged}
          />
        </>
      )}
      <div className="flex flex-row items-center">
        <Button
          activeType="switcher"
          onClick={handleCustomizeClick}
          isActive={isOpened}
          hasActiveFilters={hasActiveFilters}
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

export default TransactionsFilters;
