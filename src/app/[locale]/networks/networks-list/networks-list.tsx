import { FC } from 'react';

import NetworksListFilters from '@/app/networks/networks-list/networks-list-filters';
import NetworksListItem from '@/app/networks/networks-list/networks-list-item';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TablePagination from '@/components/common/table/table-pagination';
import { Chain } from '@/types';

interface OwnProps {
  chains: Chain[];
  currentPage?: number;
  perPage: number;
}

const NetworksList: FC<OwnProps> = async ({ perPage, chains = [], currentPage = 1 }) => {
  const baseUrl = `/networks?pp=${perPage}`;
  const pages = 1;

  return (
    <div>
      <NetworksListFilters perPage={perPage} />
      {chains.length === 0 ? (
        <div className="mt-6 text-base">No networks found, try to change filters!</div>
      ) : (
        <div>
          <table className="my-4 w-full table-auto border-collapse">
            <thead>
              <tr className="bg-table_header">
                <TableHeaderItem name="Network" sortable />
                <TableHeaderItem name="Token" sortable />
                <TableHeaderItem name="FDV" sortable />
                <TableHeaderItem name="Links" colspan={3} />
              </tr>
            </thead>
            <tbody>
              {chains.map((item) => (
                <NetworksListItem key={item.chainId} item={item} />
              ))}
            </tbody>
          </table>
          <TablePagination baseUrl={baseUrl} currentPage={currentPage} pageLength={pages} />
        </div>
      )}
    </div>
  );
};

export default NetworksList;
