import { FC } from 'react';

import NodeTxsItem from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/node-txs-items';
import { nodeTxsExample } from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/nodeTxsExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainId: number;
}

const NodeTxsList: FC<OwnProps> = async ({ chainId, sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
    {nodeTxsExample.map((item) => (
      <NodeTxsItem key={item.txHash} item={item} chainId={chainId} />
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
