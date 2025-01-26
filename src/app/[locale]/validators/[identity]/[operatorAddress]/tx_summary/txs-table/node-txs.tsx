import { FC } from 'react';

import NodeTxsList from '@/app/validators/[identity]/[operatorAddress]/tx_summary/txs-table/node-txs-list';
import NodeVotesList from '@/app/validators/[identity]/[operatorAddress]/voting_summary/node-votes-table/node-votes-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const NodeTxs: FC<OwnProps> = async ({ page, perPage, sort, currentPage }) => {
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
        <NodeTxsList perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default NodeTxs;
