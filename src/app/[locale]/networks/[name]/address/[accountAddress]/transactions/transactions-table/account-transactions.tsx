import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import AccountTransactionsList
  from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/account-transactions-list';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  chainName: string;
}

const AccountTransactions: FC<OwnProps> = async ({ chainName, page, perPage, sort, currentPage }) => {
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
        <AccountTransactionsList chainName={chainName} perPage={perPage} sort={sort} currentPage={currentPage} />
      </BaseTable>
    </div>
  );
};

export default AccountTransactions;
