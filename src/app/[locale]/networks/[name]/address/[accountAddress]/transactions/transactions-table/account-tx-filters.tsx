'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useMemo, useState, useTransition } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Button from '@/components/common/button';
import Dropdown from '@/components/common/list-filters/multiDropdown';
import PlusButton from '@/components/common/plus-button';
import type { TxAmountContext } from '@/services/tx-service';
import { cn } from '@/utils/cn';
import { formatBaseUnits } from '@/utils/decimal-string';
import {
  type TxFilters,
  displayAmountToBaseUnits,
  formatLocalDateOnly,
  hasActiveTxFilters,
  isTxAmountRangeValid,
} from '@/utils/tx-filters';
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
  amountContext: TxAmountContext;
}

const dateFromIso = (value: string | null): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

const AccountTxFilters: FC<OwnProps> = ({ chainName, filters, amountContext }) => {
  const t = useTranslations('AccountPage.Transactions');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpened, setIsOpened] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [today] = useState(() => new Date());
  const [selectedMessageTypes, setSelectedMessageTypes] = useState<TxMessageFilterId[]>(() =>
    resolveTxMessageFilterIds(chainName, filters.msgTypes),
  );
  const [fromDate, setFromDate] = useState<Date | null>(() => dateFromIso(filters.fromTime));
  const [toDate, setToDate] = useState<Date | null>(() => dateFromIso(filters.toTime));
  const [minAmount, setMinAmount] = useState(() =>
    filters.minAmount ? formatBaseUnits(filters.minAmount, amountContext.coinDecimals) : '',
  );
  const [maxAmount, setMaxAmount] = useState(() =>
    filters.maxAmount ? formatBaseUnits(filters.maxAmount, amountContext.coinDecimals) : '',
  );

  const messageOptions = useMemo(
    () =>
      getTxMessageFilterOptions(chainName).map((option) => ({
        value: option.id,
        title: t(`messageTypes.${option.id}`),
      })),
    [chainName, t],
  );
  const resolvedMessageTypes = useMemo(
    () => resolveTxMessageTypes(chainName, selectedMessageTypes),
    [chainName, selectedMessageTypes],
  );
  const minHasValue = minAmount.trim().length > 0;
  const maxHasValue = maxAmount.trim().length > 0;
  const minBaseUnits = minHasValue ? displayAmountToBaseUnits(minAmount, amountContext.coinDecimals) : null;
  const maxBaseUnits = maxHasValue ? displayAmountToBaseUnits(maxAmount, amountContext.coinDecimals) : null;
  const hasInvalidMin = minHasValue && minBaseUnits === null;
  const hasInvalidMax = maxHasValue && maxBaseUnits === null;
  const hasInvalidRange = !isTxAmountRangeValid(minBaseUnits, maxBaseUnits);
  const exceedsWireBudget = resolvedMessageTypes.length > 5;
  const applyDisabled = isPending || hasInvalidMin || hasInvalidMax || hasInvalidRange || exceedsWireBudget;
  const fromMaxDate = toDate && toDate < today ? toDate : today;

  const handleMessageTypesChanged = (values: string[]) => {
    setSelectedMessageTypes(values.filter(isTxMessageFilterId));
  };

  const navigate = (params: URLSearchParams) => {
    const query = params.toString();
    startTransition(() => router.push(`${pathname}${query ? `?${query}` : ''}`));
  };

  const handleApply = () => {
    if (applyDisabled) return;
    const params = new URLSearchParams(searchParams.toString());
    OWNED_PARAMS.forEach((param) => params.delete(param));
    resolvedMessageTypes.forEach((typeUrl) => params.append('mt', typeUrl));
    if (fromDate) params.set('from', formatLocalDateOnly(fromDate));
    if (toDate) params.set('to', formatLocalDateOnly(toDate));
    if (minBaseUnits !== null) params.set('min', minBaseUnits);
    if (maxBaseUnits !== null) params.set('max', maxBaseUnits);
    navigate(params);
  };

  const handleReset = () => {
    if (isPending) return;
    setSelectedMessageTypes([]);
    setFromDate(null);
    setToDate(null);
    setMinAmount('');
    setMaxAmount('');
    if (!hasActiveTxFilters(filters)) return;

    const params = new URLSearchParams(searchParams.toString());
    OWNED_PARAMS.forEach((param) => params.delete(param));
    navigate(params);
  };

  return (
    <div className="mb-4 flex flex-col items-end gap-4">
      <Button
        activeType="switcher"
        variant="menu"
        onClick={() => setIsOpened((opened) => !opened)}
        isActive={isOpened}
        hasActiveFilters={hasActiveTxFilters(filters)}
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
            onChange={(date: Date | null) => setFromDate(date)}
            maxDate={fromMaxDate}
            dateFormat="dd/MM/yyyy"
            isClearable
            placeholderText={t('dateFrom')}
            aria-label={t('dateFrom')}
            popperClassName="custom-popper"
            className="h-8 w-36 border-r border-t border-bgSt bg-table_row shadow-menu-button-hover px-2 text-center font-sfpro text-base text-white outline-none hover:text-highlight focus:text-highlight"
          />

          <DatePicker
            selected={toDate}
            onChange={(date: Date | null) => setToDate(date)}
            minDate={fromDate ?? undefined}
            maxDate={today}
            dateFormat="dd/MM/yyyy"
            isClearable
            placeholderText={t('dateTo')}
            aria-label={t('dateTo')}
            popperClassName="custom-popper"
            className="h-8 w-36 border-r border-t border-bgSt bg-table_row shadow-menu-button-hover px-2 text-center font-sfpro text-base text-white outline-none hover:text-highlight focus:text-highlight"
          />

          <span
            className={cn(
              'flex h-8 items-center border-r border-t border-bgSt bg-table_row shadow-menu-button-hover focus-within:text-highlight',
              (hasInvalidMin || hasInvalidRange) && 'border-red',
            )}
          >
            <input
              value={minAmount}
              onChange={(event) => setMinAmount(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              placeholder={t('amountMin')}
              aria-label={t('amountMin')}
              aria-invalid={hasInvalidMin || hasInvalidRange}
              className={cn(
                'h-full w-32 bg-transparent px-2 font-sfpro text-base text-white outline-none placeholder:text-white/40',
                (hasInvalidMin || hasInvalidRange) && 'text-red',
              )}
            />
            <span className="pr-2 font-sfpro text-xs text-white/50">{amountContext.denom}</span>
          </span>

          <span
            className={cn(
              'flex h-8 items-center border-r border-t border-bgSt bg-table_row shadow-menu-button-hover focus-within:text-highlight',
              (hasInvalidMax || hasInvalidRange) && 'border-red',
            )}
          >
            <input
              value={maxAmount}
              onChange={(event) => setMaxAmount(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              placeholder={t('amountMax')}
              aria-label={t('amountMax')}
              aria-invalid={hasInvalidMax || hasInvalidRange}
              className={cn(
                'h-full w-32 bg-transparent px-2 font-sfpro text-base text-white outline-none placeholder:text-white/40',
                (hasInvalidMax || hasInvalidRange) && 'text-red',
              )}
            />
            <span className="pr-2 font-sfpro text-xs text-white/50">{amountContext.denom}</span>
          </span>

          <Button
            component="button"
            onClick={handleReset}
            className={cn('h-8 max-h-8 text-base', isPending && 'pointer-events-none opacity-40')}
            contentClassName="max-h-7 whitespace-nowrap px-3"
            variant="menu"
            activeType="switcher"
          >
            <div className="z-20 -my-1 flex flex-row items-center justify-center whitespace-nowrap text-base font-medium">
              {t('resetFilters')}
            </div>
          </Button>
          <Button
            component="button"
            onClick={handleApply}
            className={cn('h-8 max-h-8 text-base', applyDisabled && 'pointer-events-none opacity-40')}
            contentClassName="max-h-7 whitespace-nowrap px-3"
            variant="menu"
            activeType="switcher"
            isActive
          >
            <div className="z-20 -my-1 flex flex-row items-center justify-center whitespace-nowrap text-base font-medium">
              {isPending ? t('applying') : t('apply')}
            </div>
          </Button>

          {exceedsWireBudget ? (
            <p className="w-full text-right font-sfpro text-xs text-red" aria-live="polite">
              {t('applyBudgetHint')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AccountTxFilters;
