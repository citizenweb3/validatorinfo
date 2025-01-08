import { FC } from 'react';

import ValidatorVotesList from '@/app/validators/[validatorIdentity]/governance/validator-votes/validator-votes-list';
import ValidatorNetworksList from '@/app/validators/[validatorIdentity]/networks/validator-networks/validator-networks-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorVotes: FC<OwnProps> = async ({ page, perPage, sort, currentPage }) => {
  return (
    <div>
      <table className="my-4 w-full table-auto border-collapse">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Network" sortField="name" defaultSelected />
            <TableHeaderItem page={page} name="Title" />
            <TableHeaderItem page={page} name="Vote" sortField="name" />
          </tr>
        </thead>
        <ValidatorVotesList perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default ValidatorVotes;
