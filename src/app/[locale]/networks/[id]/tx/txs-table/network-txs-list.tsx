import { FC } from 'react';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import NetworkTxsItem from '@/app/networks/[id]/tx/txs-table/network-txs-items';
import { networkTxsExample } from '@/app/networks/[id]/tx/txs-table/networkTxsExample';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  id: string;
}

const NetworkTxsList: FC<OwnProps> = async ({ id, sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
    {networkTxsExample.map((item) => (
      <NetworkTxsItem key={item.hash} id={id} item={item} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default NetworkTxsList;
