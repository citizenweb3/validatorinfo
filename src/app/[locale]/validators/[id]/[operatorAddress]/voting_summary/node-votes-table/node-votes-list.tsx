import { FC } from 'react';

import NodeVotesItems from '@/app/validators/[id]/[operatorAddress]/voting_summary/node-votes-table/node-votes-items';
import { nodeVotesExample } from '@/app/validators/[id]/[operatorAddress]/voting_summary/node-votes-table/nodeVotesExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainId: number;
}

const NodeVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, chainId }) => {
  const pages = 1;

  return (
    <tbody>
    {nodeVotesExample.map((item) => (
      <NodeVotesItems key={item.proposalId} item={item} chainId={chainId} />
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
