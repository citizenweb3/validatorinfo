import { FC } from 'react';

import NodeVotesList from '@/app/validators/[id]/[operatorAddress]/voting_summary/node-votes-table/node-votes-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

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
            <TableHeaderItem page={page} name="Title" sortField="id" />
            <TableHeaderItem page={page} name="Type" sortField="type" />
            <TableHeaderItem page={page} name="Vote" sortField="vote" />
            <TableHeaderItem page={page} name="Voting Ended" sortField="date" defaultSelected />
          </tr>
        </thead>
        <NodeVotesList perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default NodeVotes;
