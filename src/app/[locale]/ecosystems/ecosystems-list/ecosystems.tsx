import { FC } from 'react';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import EcosystemsListFilters from '@/app/ecosystems/ecosystems-list/ecosystems-list-filters';
import EcosystemsList from '@/app/ecosystems/ecosystems-list/ecosystems-list';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const Ecosystems: FC<OwnProps> = async ({ page, perPage, sort, currentPage }) => {
  return (
    <div className="mt-2">
      <EcosystemsListFilters perPage={perPage} />
      <div>
        <table className="my-4 w-full border-collapse table-fixed">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Ecosystems" sortField="Ecosystems" defaultSelected />
            <TableHeaderItem page={page} name="TVL" sortField="TVL" />
            <TableHeaderItem page={page} name="Market Cap" sortField="Market Cap" />
            <TableHeaderItem page={page} name="Projects" sortField="Projects" />
            <TableHeaderItem page={page} name="MAA" sortField="MAA" />
            <TableHeaderItem page={page} name="Revenue" sortField="Revenue" />
            <TableHeaderItem page={page} name="Tags" sortField="Tags" />
          </tr>
          </thead>
          <EcosystemsList perPage={perPage} sort={sort} currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default Ecosystems;
