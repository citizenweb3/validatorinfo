import { FC } from 'react';

import NodeTxsItem from '@/app/validators/[identity]/[operatorAddress]/tx_summary/txs-table/node-txs-items';
import { nodeTxsExample } from '@/app/validators/[identity]/[operatorAddress]/tx_summary/txs-table/nodeTxsExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NodeTxsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
      {nodeTxsExample.map((item) => (
        <NodeTxsItem key={item.txHash} item={item} />
      ))}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NodeTxsList;
