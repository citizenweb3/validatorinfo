import { FC } from 'react';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import NodesList from '@/app/nodes/nodes-list/nodes-list';

interface OwnProps extends PagesProps {
  ecosystems: string[];
  nodeStatus: string[];
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const Nodes: FC<OwnProps> = async ({ ecosystems, nodeStatus, page, perPage, sort, currentPage }) => {
  return (
    <div>
      <ListFilters perPage={perPage}
                   selectedEcosystems={ecosystems}
                   selectedNodeStatus={nodeStatus}
                   isSetPositions
                   isNetworkStage
                   isEcosystems
                   isNodeStatus />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Node Moniker" sortField="operatorAddress" defaultSelected />
            <TableHeaderItem page={page} name="Ecosystem" sortField="ecosystem" />
            <TableHeaderItem page={page} name="Network" sortField="prettyName" />
            <TableHeaderItem page={page} name="Stake" />
          </tr>
          </thead>
          <NodesList ecosystems={ecosystems}
                     nodeStatus={nodeStatus}
                     perPage={perPage}
                     sort={sort}
                     currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default Nodes;
