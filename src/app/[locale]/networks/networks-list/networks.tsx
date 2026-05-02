import { FC } from 'react';

import NetworksList from '@/app/networks/networks-list/networks-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  ecosystems: string[];
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  showAll?: boolean;
}

const Networks: FC<OwnProps> = async ({ ecosystems, page, perPage, sort, currentPage, showAll }) => {
  return (
    <div>
      <BaseTable className="mb-4">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Networks" sortField="name" defaultSelected />
            <TableHeaderItem page={page} name="Token Name" sortField="token" />
            <TableHeaderItem page={page} name="FDV" sortField="fdv" />
            <TableHeaderItem page={page} name="Supply" />
            <TableHeaderItem page={page} name="Health" />
            <TableHeaderItem page={page} name="Links" />
          </tr>
        </thead>
        <NetworksList ecosystems={ecosystems} perPage={perPage} sort={sort} currentPage={currentPage} showAll={showAll} />
      </BaseTable>
    </div>
  );
};

export default Networks;
