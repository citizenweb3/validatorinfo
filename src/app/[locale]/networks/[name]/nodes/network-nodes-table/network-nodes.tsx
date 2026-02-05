import { FC } from 'react';

import NetworkNodesList from '@/app/networks/[name]/nodes/network-nodes-table/network-nodes-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  nodeStatus: string[];
  chainName: string;
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkNodes: FC<OwnProps> = async ({ chainName, nodeStatus, page, perPage, sort, currentPage }) => {
  return (
    <div>
      <ListFilters selectedNodeStatus={nodeStatus} perPage={perPage} isNodeStatus isSetPositions />
      <div>
        <BaseTable className="my-4">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page={page} name="Node Address" sortField="operatorAddress" defaultSelected />
              <TableHeaderItem page={page} name="Node Moniker" sortField="moniker" />
              <TableHeaderItem page={page} name="Stake" sortField="delegatorShares" />
              <TableHeaderItem page={page} name="Uptime" sortField="uptime" />
              <TableHeaderItem page={page} name="Missed Blocks" sortField="missedBlocks" />
            </tr>
          </thead>
          <NetworkNodesList
            chainName={chainName}
            nodeStatus={nodeStatus}
            perPage={perPage}
            sort={sort}
            currentPage={currentPage}
          />
        </BaseTable>
      </div>
    </div>
  );
};

export default NetworkNodes;
