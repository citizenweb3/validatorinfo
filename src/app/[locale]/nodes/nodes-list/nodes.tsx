import { FC } from 'react';
import ListFilters from '@/components/common/list-filters/list-filters';
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
  networksDropdown: { value: string; title: string }[];
  allowedEcosystems: string[];
}

const Nodes: FC<OwnProps> = async ({ ecosystems, networks, nodeStatus, page, perPage, sort, currentPage, networksDropdown, allowedEcosystems }) => {
  return (
    <div>
      <ListFilters perPage={perPage}
                   selectedEcosystems={ecosystems}
                   selectedNetworks={networks}
                   selectedNodeStatus={nodeStatus}
                   networksDropdown={networksDropdown}
                   allowedEcosystems={allowedEcosystems}
                   isSetPositions
                   isNetworkStage
                   isEcosystems
                   isNetworks
                   isNodeStatus />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Node Address" sortField="operatorAddress" defaultSelected />
            <TableHeaderItem page={page} name="Node Moniker" />
            <TableHeaderItem page={page} name="Validator" />
            <TableHeaderItem page={page} name="Ecosystem" sortField="ecosystem" />
            <TableHeaderItem page={page} name="Network" sortField="prettyName" />
            <TableHeaderItem page={page} name="Stake" />
            <TableHeaderItem page={page} name="Uptime" />
            <TableHeaderItem page={page} name="Missed Blocks" />
          </tr>
          </thead>
          <NodesList ecosystems={ecosystems}
                     networks={networks}
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
