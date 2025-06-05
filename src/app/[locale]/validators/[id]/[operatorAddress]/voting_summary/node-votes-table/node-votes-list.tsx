import { FC } from 'react';

import NodeVotesItems from '@/app/validators/[id]/[operatorAddress]/voting_summary/node-votes-table/node-votes-items';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import voteService, { ChainNodeVote } from '@/services/vote-service';
import {
  nodeVotesExample,
} from '@/app/validators/[id]/[operatorAddress]/voting_summary/node-votes-table/nodeVotesExample';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  operatorAddress: string;
}

const NodeVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, operatorAddress }) => {
  let votesList: ChainNodeVote[] = [];
  let pages = 1;

  const result = await voteService.getChainNodeVotes(
    operatorAddress,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  if (result.votes.length === 0) {
    votesList = nodeVotesExample;
  } else {
    votesList = result.votes;
    pages = result.pages;
  }

  return (
    <tbody>
    {votesList.map((item) => (
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
