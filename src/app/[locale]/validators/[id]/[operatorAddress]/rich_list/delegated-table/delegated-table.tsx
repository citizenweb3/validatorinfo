import { FC, Suspense } from 'react';

import DelegatedEventsList
  from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/delegated-events-list';
import BaseTable from '@/components/common/table/base-table';
import DelegateTableHead from '@/components/delegations/delegate-table-head';
import DelegateRowsSkeleton from '@/components/delegations/delegate-rows-skeleton';
import type { DelegationSort } from '@/services/delegation-service';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  chainName: string;
  operatorAddress: string;
  sort: DelegationSort;
  cursorToken?: string;
  windowIndex: number;
}

const DelegatedTable: FC<OwnProps> = async ({ chainName, page, operatorAddress, sort, cursorToken, windowIndex }) => {
  const fallback = (
    <BaseTable>
      <DelegateTableHead page={page} />
      <DelegateRowsSkeleton rows={20} />
    </BaseTable>
  );

  return (
    <div>
      <Suspense key={`${operatorAddress}-${sort.sortBy}-${sort.order}`} fallback={fallback}>
        <DelegatedEventsList
          page={page}
          chainName={chainName}
          operatorAddress={operatorAddress}
          sort={sort}
          cursorToken={cursorToken}
          windowIndex={windowIndex}
        />
      </Suspense>
    </div>
  );
};

export default DelegatedTable;
