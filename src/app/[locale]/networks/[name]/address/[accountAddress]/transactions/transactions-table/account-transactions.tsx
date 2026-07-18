import { FC, Suspense } from 'react';

import AccountTransactionsList from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/account-transactions-list';
import AccountTxFilters from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/account-tx-filters';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TxRowsSkeleton from '@/components/txs/tx-rows-skeleton';
import type { TxAmountContext } from '@/services/tx-service';
import { PagesProps } from '@/types';
import type { TxFilters } from '@/utils/tx-filters';

interface OwnProps extends PagesProps {
  chainName: string;
  accountAddress: string;
  cursorToken?: string;
  windowIndex: number;
  filters: TxFilters;
  filterKey: string;
  amountContext: TxAmountContext | null;
  amountLabel: string;
}

const AccountTransactions: FC<OwnProps> = ({
  chainName,
  page,
  accountAddress,
  cursorToken,
  windowIndex,
  filters,
  filterKey,
  amountContext,
  amountLabel,
}) => {
  return (
    <div className="pt-8">
      {amountContext ? (
        <AccountTxFilters key={filterKey} chainName={chainName} filters={filters} amountContext={amountContext} />
      ) : null}
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Type of Tx" sortField="type" />
            <TableHeaderItem page={page} name="Tx Hash" sortField="tx" />
            <TableHeaderItem page={page} name="Timestamp" sortField="timestamp" defaultSelected />
            <TableHeaderItem page={page} name="Block Height" sortField="block height" />
            {amountContext ? (
              <TableHeaderItem page={page}>
                <div className="flex items-center justify-center py-3">
                  <div className="text-nowrap text-6xl font-normal sm:text-4xl md:text-sm">{amountLabel}</div>
                </div>
              </TableHeaderItem>
            ) : null}
          </tr>
        </thead>
        <Suspense
          key={`${accountAddress}:${filterKey}`}
          fallback={<TxRowsSkeleton rows={20} columns={amountContext ? 5 : 4} />}
        >
          <AccountTransactionsList
            chainName={chainName}
            accountAddress={accountAddress}
            cursorToken={cursorToken}
            windowIndex={windowIndex}
            filters={filters}
            amountContext={amountContext}
          />
        </Suspense>
      </BaseTable>
    </div>
  );
};

export default AccountTransactions;
