import { FC } from 'react';

import ValidatorNodesItem from '@/app/validators/[id]/public_goods/infrastructure/validator-nodes/validator-nodes-item';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  nodes: { color: string; networks: string; url: string }[];
}

const ValidatorNodesList: FC<OwnProps> = async ({ nodes, sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
      {nodes.map((item) => (
        <ValidatorNodesItem key={item.color + item.url} item={item} />
      ))}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default ValidatorNodesList;
