import { FC } from 'react';

import ValidatorNodesItem from '@/app/validators/[id]/(validator-profile)/public_goods/infrastructure/validator-nodes/validator-nodes-item';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import { InfrastructureNode } from '@/services/infrastructure-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  totalPages: number;
  sort: { sortBy: string; order: SortDirection };
  nodes: InfrastructureNode[];
}

const ValidatorNodesList: FC<OwnProps> = async ({ nodes, sort, perPage, currentPage = 1, totalPages }) => {
  return (
    <tbody>
      {nodes.map((node) => (
        <ValidatorNodesItem key={node.id} node={node} />
      ))}
      {totalPages > 1 && (
        <tr>
          <td colSpan={7} className="pt-4">
            <TablePagination pageLength={totalPages} />
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default ValidatorNodesList;
