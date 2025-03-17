import { FC } from 'react';

import ValidatorNetworksList
  from '@/app/validators/[id]/(validator-profile)/networks/validator-networks/validator-networks-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import ListFilters from '@/components/common/list-filters/list-filters';

interface OwnProps extends PagesProps {
  id: number;
  perPage: number;
  ecosystems: string[];
  nodeStatus: string[];
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorNetworks: FC<OwnProps> = async ({ id, perPage, currentPage, ecosystems, nodeStatus, page, sort }) => {
  return (
    <div>
      <ListFilters perPage={perPage}
                   selectedNodeStatus={nodeStatus}
                   selectedEcosystems={ecosystems}
                   isEcosystems
                   isNodeStatus
                   isNetworkStage
                   isSetPositions />
      <div>
        <table className="mt-4 w-full table-auto border-collapse">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Network" sortField="prettyName" defaultSelected />
            <TableHeaderItem page={page} name="Expected APR" sortField="apr" />
            <TableHeaderItem page={page} name="Fans" sortField="fans" />
            <TableHeaderItem page={page} name="Rank" sortField="rank" />
            <TableHeaderItem page={page} name="Voting Power" sortField="delegator_shares" />
            <TableHeaderItem page={page} name="Commission" sortField="rate" />
            <TableHeaderItem page={page} name="Self Delegation" sortField="min_self_delegation" />
            <TableHeaderItem page={page} name="Uptime" sortField="uptime" />
            <TableHeaderItem page={page} name="Missed Blocks" sortField="blocks" />
            <TableHeaderItem page={page} name="Infrastructure" />
            <TableHeaderItem page={page} name="Governance" sortField="governance" />
          </tr>
          </thead>
          <ValidatorNetworksList
            id={id}
            sort={sort}
            ecosystems={ecosystems}
            nodeStatus={nodeStatus} />
        </table>
      </div>
    </div>
  );
};

export default ValidatorNetworks;
