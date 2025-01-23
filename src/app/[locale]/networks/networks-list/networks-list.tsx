import { FC } from 'react';

import NetworksListItem from '@/app/networks/networks-list/networks-list-item';
import TablePagination from '@/components/common/table/table-pagination';
import ChainService from '@/services/chain-service';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  ecosystems: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworksList: FC<OwnProps> = async ({ sort, perPage, ecosystems, currentPage = 1 }) => {
  const { chains: list, pages } = await ChainService.getAll(
    ecosystems,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <NetworksListItem key={item.chainId} item={item} />
      ))}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NetworksList;
