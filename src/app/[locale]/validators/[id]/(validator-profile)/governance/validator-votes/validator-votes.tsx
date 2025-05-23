import { FC } from 'react';

import ValidatorVotesList from '@/app/validators/[id]/(validator-profile)/governance/validator-votes/validator-votes-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  validatorId: number | undefined;
}

const ValidatorVotes: FC<OwnProps> = async ({ page, perPage, sort, currentPage, validatorId }) => {
  return (
    <div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Network" sortField="chain" defaultSelected />
            <TableHeaderItem page={page} name="Title" />
            <TableHeaderItem page={page} name="Vote" sortField="vote" />
          </tr>
        </thead>
        <ValidatorVotesList
          perPage={perPage}
          sort={sort}
          currentPage={currentPage}
          validatorId={validatorId} />
      </table>
    </div>
  );
};

export default ValidatorVotes;
