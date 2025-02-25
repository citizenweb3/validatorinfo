import { FC } from 'react';

import NodeTxsList from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/node-txs-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  chainId: number;
}

const NodeTxs: FC<OwnProps> = async ({ chainId, page, perPage, sort, currentPage }) => {
  console.log(chainId);
  return (
    <div className="pt-10">
      <table className="w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Type of Tx" sortField="type" />
          <TableHeaderItem page={page} name="Tx Hash" sortField="tx" />
          <TableHeaderItem page={page} name="Timestamp" sortField="timestamp" defaultSelected />
          <TableHeaderItem page={page} name="Block Height" sortField="block height" />
        </tr>
        </thead>
        <NodeTxsList chainId={chainId} perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default NodeTxs;
