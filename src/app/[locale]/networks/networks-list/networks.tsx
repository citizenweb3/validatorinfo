import { FC } from 'react';

import NetworksList from '@/app/networks/networks-list/networks-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import Tooltip from '@/components/common/tooltip';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  ecosystems: string[];
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const Networks: FC<OwnProps> = async ({ ecosystems, page, perPage, sort, currentPage }) => {
  return (
    <div>
      <ListFilters
        perPage={perPage}
        selectedEcosystems={ecosystems}
        isEcosystems
        isNetworkStage />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Network" sortField="name" defaultSelected />
            <TableHeaderItem page={page} name="Token" sortField="name" defaultSelected />
            <TableHeaderItem
              page={page}
              name="FDV"
              sortField="name"
              defaultSelected
              tooltip="Fully Diluted Valuation"
            />
            <TableHeaderItem page={page} name="Links" colspan={3} />
          </tr>
          </thead>
          <NetworksList ecosystems={ecosystems} perPage={perPage} sort={sort} currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default Networks;
