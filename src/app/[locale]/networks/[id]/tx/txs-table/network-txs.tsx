import { FC } from 'react';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import NetworkTxsList from '@/app/networks/[id]/tx/txs-table/network-txs-list';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  id: string;
}

const NetworkTxs: FC<OwnProps> = async ({ id, page, perPage, sort, currentPage }) => {
  return (
    <div className="mt-12">
      <table className="w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Tx Hash" sortField="tx" />
          <TableHeaderItem page={page} name="Type of Tx" sortField="type" />
          <TableHeaderItem page={page} name="Block Height" sortField="block height" />
          <TableHeaderItem page={page} name="Timestamp" sortField="timestamp" defaultSelected />
        </tr>
        </thead>
        <NetworkTxsList id={id} perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default NetworkTxs;
