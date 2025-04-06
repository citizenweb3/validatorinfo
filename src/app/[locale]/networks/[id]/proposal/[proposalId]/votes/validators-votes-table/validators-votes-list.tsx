import { FC } from 'react';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import ValidatorsVotesItem from '@/app/networks/[id]/proposal/[proposalId]/votes/validators-votes-table/validators-votes-item';
import { validatorsVotes } from '@/app/networks/[id]/proposal/[proposalId]/votes/validators-votes-table/validatorsVotesExample';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorsVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
    {validatorsVotes.map((item) => (
      <ValidatorsVotesItem key={item.txHash} item={item} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default ValidatorsVotesList;
