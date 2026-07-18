import { FC, Suspense } from 'react';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TxRowsSkeleton from '@/components/txs/tx-rows-skeleton';
import { PagesProps } from '@/types';
import AccountTransactionsList
  from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/account-transactions-list';
import type { TxFilters } from '@/utils/tx-filters';

interface OwnProps extends PagesProps {
  chainName: string;
  accountAddress: string;
  cursorToken?: string;
  windowIndex: number;
  filters: TxFilters;
  filterKey: string;
}

const AccountTransactions: FC<OwnProps> = ({
  chainName,
  page,
  accountAddress,
  cursorToken,
  windowIndex,
  filters,
  filterKey,
}) => {
  return (
    <div className="pt-8">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Type of Tx" sortField="type" />
            <TableHeaderItem page={page} name="Tx Hash" sortField="tx" />
            <TableHeaderItem page={page} name="Timestamp" sortField="timestamp" defaultSelected />
            <TableHeaderItem page={page} name="Block Height" sortField="block height" />
          </tr>
        </thead>
        <Suspense key={`${accountAddress}:${filterKey}`} fallback={<TxRowsSkeleton rows={20} />}>
          <AccountTransactionsList
            chainName={chainName}
            accountAddress={accountAddress}
            cursorToken={cursorToken}
            windowIndex={windowIndex}
            filters={filters}
          />
        </Suspense>
      </BaseTable>
    </div>
  );
};

export default AccountTransactions;
