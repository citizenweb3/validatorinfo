import { FC } from 'react';

import ValidatorNodesList from '@/app/validators/[identity]/public_goods/infrastructure/validator-nodes/validator-nodes-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  nodes: { color: string; networks: string; url: string }[];
}

const ValidatorNodesTable: FC<OwnProps> = async ({ nodes, page, perPage, sort, currentPage }) => {
  return (
    <div>
      <table className="mt-4 w-full table-auto border-collapse">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Networks" sortField="name" defaultSelected />
            <TableHeaderItem page={page} name="URL" />
          </tr>
        </thead>
        <ValidatorNodesList nodes={nodes} perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default ValidatorNodesTable;
