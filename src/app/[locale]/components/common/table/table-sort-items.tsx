'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';

import SortButton from '@/components/common/sort-button';
import Tooltip from '@/components/common/tooltip';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  name: string;
  field?: string;
  defaultSelected?: boolean;
}

const TableSortItems: FC<OwnProps> = ({ name, field, defaultSelected = false }) => {
  const t = useTranslations('HomePage.Table');

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const currentSortBy = sp.get('sortBy');
  const currentOrder = sp.get('order') ?? 'asc';

  const onSort = () => {
    const newSp = new URL(location.href).searchParams;
    newSp.set('sortBy', field!);
    newSp.set(
      'order',
      (currentSortBy === field && currentOrder === 'asc') || (!currentSortBy && defaultSelected) ? 'desc' : 'asc',
    );
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div
      className={`${field && 'cursor-pointer'} group flex flex-row items-center justify-center py-3`}
      onClick={() => field && onSort()}
    >
      {field && (
        <div className="flex flex-col items-center justify-center">
          <SortButton
            isActive={currentSortBy === field || (!currentSortBy && defaultSelected)}
            direction={currentSortBy === field ? (currentOrder as SortDirection) : 'asc'}
          />
        </div>
      )}
      <Tooltip tooltip={`${t(`${name}.hint` as 'Validator.hint')}`} direction="top">
        <div className="w-fit text-wrap text-sm">
          <div className="text-nowrap font-bold">&nbsp;{t(`${name}.name` as 'Validator.name')}</div>
        </div>
      </Tooltip>
    </div>
  );
};

export default TableSortItems;
