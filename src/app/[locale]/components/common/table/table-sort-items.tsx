'use client';

import { NamespaceKeys, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';

import SortButton from '@/components/common/sort-button';
import Tooltip from '@/components/common/tooltip';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  name: string;
  field?: string;
  defaultSelected?: boolean;
  defaultOrder?: SortDirection;
}

const TableSortItems: FC<OwnProps> = ({ page, name, field, defaultSelected = false, defaultOrder = 'asc' }) => {
  const t = useTranslations(`${page}.Table` as NamespaceKeys<IntlMessages, 'HomePage.Table'>);

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const currentSortBy = sp.get('sortBy');
  const currentOrder = sp.get('order') ?? 'asc';

  // The order the user currently sees for this column: explicit URL state, or the page default
  // when nothing is selected yet and this column is the default one. Clicking flips it.
  const effectiveOrder: SortDirection | null =
    currentSortBy === field
      ? (currentOrder as SortDirection)
      : !currentSortBy && defaultSelected
        ? defaultOrder
        : null;

  const onSort = () => {
    const newSp = new URL(location.href).searchParams;
    newSp.set('sortBy', field!);
    newSp.set('order', effectiveOrder === 'asc' ? 'desc' : 'asc');
    router.push(`${pathname}?${newSp.toString()}`, { scroll: false });
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
            direction={effectiveOrder ?? 'asc'}
          />
        </div>
      )}
      <Tooltip tooltip={`${t(`${name}.hint` as 'Validator.hint')}`} direction="top">
        <div className="w-fit text-wrap text-6xl sm:text-4xl md:text-sm">
          <div className="text-nowrap font-normal">&nbsp;{t(`${name}.name` as 'Validator.name')}</div>
        </div>
      </Tooltip>
    </div>
  );
};

export default TableSortItems;
