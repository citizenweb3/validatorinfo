import { FC } from 'react';

import NodeVotesItems from '@/app/validators/[identity]/[operatorAddress]/voting_summary/node-votes-table/node-votes-items';
import { votes } from '@/app/validators/[identity]/[operatorAddress]/voting_summary/node-votes-table/nodeVotesExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NodeVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
      {votes.map((item) => (
        <NodeVotesItems key={item.proposalId} item={item} />
      ))}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NodeVotesList;
