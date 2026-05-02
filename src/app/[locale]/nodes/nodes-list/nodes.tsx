import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import NodesList from '@/app/nodes/nodes-list/nodes-list';

interface OwnProps extends PagesProps {
  ecosystems: string[];
  networks: string[];
  nodeStatus: string[];
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const Nodes: FC<OwnProps> = async ({ ecosystems, networks, nodeStatus, page, perPage, sort, currentPage }) => {
  return (
    <div>
      <BaseTable className="mb-4">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Node Moniker" defaultSelected />
            <TableHeaderItem page={page} name="Ecosystem" sortField="ecosystem" />
            <TableHeaderItem page={page} name="Network" sortField="prettyName" />
            <TableHeaderItem page={page} name="Stake" />
          </tr>
        </thead>
        <NodesList
          ecosystems={ecosystems}
          networks={networks}
          nodeStatus={nodeStatus}
          perPage={perPage}
          sort={sort}
          currentPage={currentPage}
        />
      </BaseTable>
    </div>
  );
};

export default Nodes;
