import { FC } from 'react';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import { accountTxsExample } from '@/app/networks/[id]/address/[accountAddress]/transactions/transactions-table/accountTxsExample';
import AccountTransactionsItem from '@/app/networks/[id]/address/[accountAddress]/transactions/transactions-table/account-transactions-item';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainId: number;
}

const AccountTransactionsList: FC<OwnProps> = async ({ chainId, sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
    {accountTxsExample.map((item) => (
      <AccountTransactionsItem key={item.txHash} item={item} chainId={chainId} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default AccountTransactionsList;
