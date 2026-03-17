import { FC } from 'react';

import VotingHistoryList from '@/app/networks/[name]/address/[accountAddress]/governance/voting-history/voting-history-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  chainName: string;
}

const VotingHistoryTable: FC<OwnProps> = async ({ page, chainName }) => {
  return (
    <div>
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Proposal ID" sortField="proposalId" />
            <TableHeaderItem page={page} name="Title" />
            <TableHeaderItem page={page} name="Vote" sortField="vote" />
            <TableHeaderItem page={page} name="Network Impact" sortField="networkImpact" defaultSelected />
            <TableHeaderItem page={page} name="Date" sortField="timestamp" />
          </tr>
        </thead>
        <VotingHistoryList chainName={chainName} />
      </BaseTable>
    </div>
  );
};

export default VotingHistoryTable;
