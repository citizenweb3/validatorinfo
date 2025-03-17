import { FC } from 'react';

import ValidatorVotesItem from '@/app/validators/[id]/(validator-profile)/governance/validator-votes/validator-votes-items';
import { validatorExample } from '@/app/validators/[id]/(validator-profile)/validatorExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';

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
