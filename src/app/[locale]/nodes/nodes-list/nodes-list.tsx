import { FC } from 'react';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import NodeService from '@/services/node-service';
import NodesListItem from '@/app/nodes/nodes-list/nodes-list-item';

interface OwnProps {
  ecosystems: string[];
  nodeStatus: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NodesList: FC<OwnProps> = async ({ sort, perPage, ecosystems, nodeStatus, currentPage = 1 }) => {
  const { nodes: list, pages } = await NodeService.getAll(
    ecosystems,
    nodeStatus,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
    {list.map((item) => (
      <NodesListItem key={item.id} item={item} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default NodesList;
