import { FC } from 'react';

import ValidatorNodesList from '@/app/validators/[id]/(validator-profile)/public_goods/infrastructure/validator-nodes/validator-nodes-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { InfrastructureNode } from '@/services/infrastructure-service';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  totalPages: number;
  sort: { sortBy: string; order: SortDirection };
  nodes: InfrastructureNode[];
}

const ValidatorNodesTable: FC<OwnProps> = async ({ nodes, page, perPage, sort, currentPage, totalPages }) => {
  return (
    <div>
      <table className="mt-4 w-full table-auto border-collapse">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} className="w-8">
              <span className="text-xs">&nbsp;</span>
            </TableHeaderItem>
            <TableHeaderItem page={page} name="Network" sortField="chain" />
            <TableHeaderItem page={page} name="URL" />
            <TableHeaderItem page={page} name="Response Time" />
            <TableHeaderItem page={page} name="Last Check" />
          </tr>
        </thead>
        <ValidatorNodesList
          nodes={nodes}
          perPage={perPage}
          sort={sort}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </table>
    </div>
  );
};

export default ValidatorNodesTable;
