import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/services/validator-service';
import { validatorExample } from '@/app/validators/[identity]/validatorExample';
import ValidatorVotesItem from '@/app/validators/[identity]/governance/validator-votes/validator-votes-items';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
    {validatorExample.votes.map((item) => (
      <ValidatorVotesItem key={item.proposalId} item={item} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default ValidatorVotesList;
