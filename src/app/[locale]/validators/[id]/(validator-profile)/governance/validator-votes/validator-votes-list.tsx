import { FC } from 'react';

import ValidatorVotesItem
  from '@/app/validators/[id]/(validator-profile)/governance/validator-votes/validator-votes-items';
import { votesExample } from '@/app/validators/[id]/(validator-profile)/validatorExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import voteService, { ValidatorVote } from '@/services/vote-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  validatorId: number | undefined;
}

const ValidatorVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, validatorId }) => {
  let votesList: ValidatorVote[] = [];
  let pages = 1;

  if (validatorId === undefined) {
    votesList = votesExample;
    pages = 1;
  } else {
    const result = await voteService.getValidatorVotes(
      validatorId,
      perPage * (currentPage - 1),
      perPage,
      sort.sortBy,
      sort.order,
    );

    if (result.votes.length === 0) {
      votesList = votesExample;
    } else {
      votesList = result.votes;
      pages = result.pages;
    }
  }

  if (validatorId === undefined) return null;
  return (
    <tbody>
      {votesList.map((item) => <ValidatorVotesItem key={item.proposalDbId} item={item} validatorId={validatorId} />)}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={pages} isScroll={false} />
        </td>
      </tr>
    </tbody>
  );
};

export default ValidatorVotesList;
