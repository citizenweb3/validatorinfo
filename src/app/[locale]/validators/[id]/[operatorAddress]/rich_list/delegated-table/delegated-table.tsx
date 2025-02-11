import { FC } from 'react';

import DelegatedEventsList from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/delegated-events-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const DelegatedTable: FC<OwnProps> = async ({ page, perPage, sort, currentPage }) => {
  return (
    <div>
      <div>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page={page} name="Address" />
              <TableHeaderItem page={page} name="Amount" sortField="amount" />
              <TableHeaderItem page={page} name="Happened" sortField="happened" defaultSelected />
              <TableHeaderItem page={page} name="Tx Hash" sortField="tx" />
              <TableHeaderItem page={page} name="Block Height" sortField="tx" />
            </tr>
          </thead>
          <DelegatedEventsList perPage={perPage} sort={sort} currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default DelegatedTable;
