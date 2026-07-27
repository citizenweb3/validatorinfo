'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useMemo, useState, useTransition } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Button from '@/components/common/button';
import Dropdown from '@/components/common/list-filters/multiDropdown';
import PlusButton from '@/components/common/plus-button';
import { cn } from '@/utils/cn';
import { type TxFilters, formatLocalDateOnly, hasActiveTxFilters } from '@/utils/tx-filters';
import {
  type TxMessageFilterId,
  getTxMessageFilterOptions,
  isTxMessageFilterId,
  resolveTxMessageFilterIds,
  resolveTxMessageTypes,
} from '@/utils/tx-message-types';

const OWNED_PARAMS = ['mt', 'from', 'to', 'min', 'max', 'c', 'w'] as const;

interface OwnProps {
  chainName: string;
  filters: TxFilters;
}

const dateFromIso = (value: string | null): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

const menuControl = 'border-r border-t border-bgSt bg-table_row shadow-menu-button-hover';

// Filters commit instantly on change like every ListFilters consumer. Reset follows the
// site-wide gesture: three quick clicks on Customize clear every owned param.
const AccountTxFilters: FC<OwnProps> = ({ chainName, filters }) => {
  const t = useTranslations('AccountPage.Transactions');
  const tTable = useTranslations('HomePage.Table');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpened, setIsOpened] = useState(false);
  const [resetClicks, setResetClicks] = useState(0);
  const [, startTransition] = useTransition();
  const [today] = useState(() => new Date());

  const selectedMessageTypes = useMemo(
    () => resolveTxMessageFilterIds(chainName, filters.msgTypes),
    [chainName, filters.msgTypes],
  );
  const fromDate = useMemo(() => dateFromIso(filters.fromTime), [filters.fromTime]);
  const toDate = useMemo(() => dateFromIso(filters.toTime), [filters.toTime]);
  const messageOptions = useMemo(
    () =>
      getTxMessageFilterOptions(chainName).map((option) => ({
        value: option.id,
        title: t(`messageTypes.${option.id}`),
      })),
    [chainName, t],
  );

  const fromMaxDate = toDate && toDate < today ? toDate : today;

  useEffect(() => {
    if (resetClicks >= 3) {
      const params = new URLSearchParams(searchParams.toString());
      OWNED_PARAMS.forEach((param) => params.delete(param));
      const query = params.toString();
      startTransition(() => router.push(`${pathname}${query ? `?${query}` : ''}`));
      setIsOpened(false);
    }
    const tm = setTimeout(() => setResetClicks(0), 1000);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetClicks]);

  const pushFilters = (next: {
    messageTypeIds?: TxMessageFilterId[];
    from?: Date | null;
    to?: Date | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    OWNED_PARAMS.forEach((param) => params.delete(param));

    const messageTypeIds = next.messageTypeIds ?? selectedMessageTypes;
    resolveTxMessageTypes(chainName, messageTypeIds).forEach((typeUrl) => params.append('mt', typeUrl));

    const from = next.from !== undefined ? next.from : fromDate;
    const to = next.to !== undefined ? next.to : toDate;
    if (from) params.set('from', formatLocalDateOnly(from));
    if (to) params.set('to', formatLocalDateOnly(to));


    const query = params.toString();
    startTransition(() => router.push(`${pathname}${query ? `?${query}` : ''}`));
  };

  const handleMessageTypesChanged = (values: string[]) => {
    const ids = values.filter(isTxMessageFilterId);
    // The API accepts at most five type-urls; on AtomOne one choice can resolve to two, so a
    // selection that would overflow the wire budget is ignored rather than silently truncated.
    if (resolveTxMessageTypes(chainName, ids).length > 5) return;
    pushFilters({ messageTypeIds: ids });
  };



  const handleCustomizeClick = () => {
    setIsOpened((opened) => !opened);
    setResetClicks((clicks) => clicks + 1);
  };

  return (
    <div className="mb-4 flex flex-col items-end gap-4">
      <Button
        activeType="switcher"
        variant="menu"
        onClick={handleCustomizeClick}
        isActive={isOpened}
        hasActiveFilters={hasActiveTxFilters(filters)}
        tooltip={tTable('Click 3 times to reset all filters')}
      >
        <div className="z-20 -my-1 flex flex-row items-center justify-center py-px text-base font-medium">
          <span>{t('customize')}</span>
          <PlusButton size="sm" isOpened={isOpened} />
        </div>
      </Button>

      {isOpened ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-3">
          <Dropdown
            filterValues={messageOptions}
            title={t('msgTypeLabel')}
            selectedValue={selectedMessageTypes}
            onChanged={handleMessageTypesChanged}
            maxSelectionLimit={5}
            selectAllLabel={t('selectAll')}
            clearAllLabel={t('clearAll')}
          />

          <DatePicker
            selected={fromDate}
            onChange={(date: Date | null) => pushFilters({ from: date })}
            maxDate={fromMaxDate}
            dateFormat="dd/MM/yyyy"
            isClearable
            placeholderText={t('dateFrom')}
            aria-label={t('dateFrom')}
            popperClassName="custom-popper"
            className={cn(
              menuControl,
              'h-8 w-36 px-2 text-center font-sfpro text-base text-white outline-none hover:text-highlight focus:text-highlight',
            )}
          />

          <DatePicker
            selected={toDate}
            onChange={(date: Date | null) => pushFilters({ to: date })}
            minDate={fromDate ?? undefined}
            maxDate={today}
            dateFormat="dd/MM/yyyy"
            isClearable
            placeholderText={t('dateTo')}
            aria-label={t('dateTo')}
            popperClassName="custom-popper"
            className={cn(
              menuControl,
              'h-8 w-36 px-2 text-center font-sfpro text-base text-white outline-none hover:text-highlight focus:text-highlight',
            )}
          />


        </div>
      ) : null}
    </div>
  );
};

export default AccountTxFilters;
