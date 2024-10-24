import { FC } from 'react';

import NetworksList from '@/app/networks/networks-list/networks-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const Networks: FC<OwnProps> = async ({ perPage, sort, currentPage }) => {
  return (
    <div>
      <ListFilters perPage={perPage} />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem name="Network" sortField="name" />
              <TableHeaderItem name="Token" />
              <TableHeaderItem name="FDV" />
              <TableHeaderItem name="Links" colspan={3} />
            </tr>
          </thead>
          <NetworksList perPage={perPage} sort={sort} currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default Networks;
