import { FC } from 'react';

import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';
import { PagesProps } from '@/types';
import NodeVotesList from '@/app/validators/[identity]/[operatorAddress]/voting_summary/node-votes-table/node-votes-list';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const NodeVotes: FC<OwnProps> = async ({ page, perPage, sort, currentPage }) => {
  return (
    <div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Title" sortField="id" defaultSelected />
            <TableHeaderItem page={page} name="Type" sortField="type" />
            <TableHeaderItem page={page} name="Vote" sortField="vote" />
            <TableHeaderItem page={page} name="Voting Ended" sortField="date" />
          </tr>
        </thead>
        <NodeVotesList perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default NodeVotes;
