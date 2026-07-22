'use client';

import { useTranslations } from 'next-intl';
import { FC, ReactNode, useCallback, useState } from 'react';

import BaseTable from '@/components/common/table/base-table';
import Switch from '@/components/common/switch';
import DelegateListClient from '@/components/delegations/delegate-list-client';
import type { DelegationBatch, DelegationCursor, DelegationSort } from '@/services/delegation-service';

type AmountUnit = 'token' | 'usd';

interface OwnProps {
  chainName: string;
  validator: string;
  price: number | null;
  sort: DelegationSort;
  initialCursor: DelegationCursor | null;
  initialWindow: number;
  initial: DelegationBatch;
  children: ReactNode;
}

const DelegateTableClient: FC<OwnProps> = ({
  chainName,
  validator,
  price,
  sort,
  initialCursor,
  initialWindow,
  initial,
  children,
}) => {
  const t = useTranslations('RichListPage');
  const [unit, setUnit] = useState<AmountUnit>('token');
  const canUsd = price != null && price > 0;
  const effectiveUnit: AmountUnit = canUsd ? unit : 'token';

  const handleUnitChange = useCallback((isToken: boolean) => {
    setUnit(isToken ? 'token' : 'usd');
  }, []);

  return (
    <>
      {canUsd && (
        <div className="mb-4 flex h-5 flex-row items-center justify-end space-x-2 text-lg uppercase">
          <div className="border-b border-bgSt px-2 font-handjet">USD</div>
          <Switch value={unit === 'token'} onChange={handleUnitChange} />
          <div className="border-b border-bgSt px-2 font-handjet">{t('token')}</div>
        </div>
      )}
      <BaseTable>
        {children}
        <DelegateListClient
          validator={validator}
          chainName={chainName}
          sort={sort}
          initialCursor={initialCursor}
          initialWindow={initialWindow}
          initial={initial}
          unit={effectiveUnit}
          price={price ?? 0}
        />
      </BaseTable>
    </>
  );
};

export default DelegateTableClient;
