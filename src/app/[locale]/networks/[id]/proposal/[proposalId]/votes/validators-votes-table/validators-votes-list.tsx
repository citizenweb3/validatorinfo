import { FC } from 'react';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import ValidatorsVotesItem
  from '@/app/networks/[id]/proposal/[proposalId]/votes/validators-votes-table/validators-votes-item';
import {
  validatorsVotes,
} from '@/app/networks/[id]/proposal/[proposalId]/votes/validators-votes-table/validatorsVotesExample';
import voteService, { ProposalValidatorsVotes } from '@/services/vote-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainId: number;
  proposalId: string;
  vote: string;
  search: string;
}

const ValidatorsVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, chainId, proposalId, vote, search }) => {
  let votesList: ProposalValidatorsVotes[] = [];
  let pages = 1;

  if (chainId === 17 || chainId === 27) {
    const result = await voteService.getProposalValidatorsVotes(
      chainId,
      proposalId,
      perPage * (currentPage - 1),
      perPage,
      sort.sortBy,
      sort.order,
      vote,
      parseInt(search)
    );
    votesList = result.votes;
    pages = result.pages;
  } else {
    votesList = validatorsVotes;
  }

  return (
    <>
      {votesList.length > 0 ? (
        <tbody>
        {votesList.map((item) => (
          <ValidatorsVotesItem key={item.validator.id} item={item} />
        ))}
        <tr>
          <td colSpan={5} className="pt-4">
            <TablePagination pageLength={pages} isScroll={false} />
          </td>
        </tr>
        </tbody>
      ) : (
        <tbody>
        <tr>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
        </tr>
        </tbody>
      )}
    </>

  );
};

export default ValidatorsVotesList;
