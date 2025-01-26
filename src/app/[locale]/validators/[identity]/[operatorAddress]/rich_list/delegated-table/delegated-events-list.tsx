import { FC } from 'react';

import DelegatedEventsItem from '@/app/validators/[identity]/[operatorAddress]/rich_list/delegated-table/delegated-events-items';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/services/validator-service';
import {
  delegates
} from '@/app/validators/[identity]/[operatorAddress]/rich_list/delegated-table/nodeDelegatesExample';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const DelegatedEventsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
      {delegates.map((item) => (
        <DelegatedEventsItem key={item.txHash} item={item} />
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
