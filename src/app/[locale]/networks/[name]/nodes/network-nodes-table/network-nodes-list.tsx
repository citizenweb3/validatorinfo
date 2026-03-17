import { FC } from 'react';

import NetworkNodesListItem from '@/app/networks/[name]/nodes/network-nodes-table/network-nodes-list-item';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import nodeService from '@/services/node-service';

interface OwnProps {
  chainName: string;
  nodeStatus: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkNodesList: FC<OwnProps> = async ({ chainName, sort, perPage, nodeStatus, currentPage = 1 }) => {
  const isAztecNetwork = ['aztec', 'aztec-testnet'].includes(chainName);

  const { nodes: list, pages } = await nodeService.getAll(
    [],
    [chainName],
    nodeStatus,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <NetworkNodesListItem key={item.id} item={item} />
      ))}
      <tr>
        <td colSpan={isAztecNetwork ? 6 : 5} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NetworkNodesList;
