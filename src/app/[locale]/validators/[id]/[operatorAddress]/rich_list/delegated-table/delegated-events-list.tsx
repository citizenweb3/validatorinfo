import { FC } from 'react';

import DelegatedEventsItem
  from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/delegated-events-items';
import { delegates } from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/nodeDelegatesExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainId: number;
}

const DelegatedEventsList: FC<OwnProps> = async ({ chainId, sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
    {delegates.map((item) => (
      <DelegatedEventsItem key={item.txHash} item={item} chainId={chainId} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default DelegatedEventsList;
