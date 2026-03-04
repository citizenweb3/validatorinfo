import { FC } from 'react';

import NetworkViewToggle
  from '@/app/validators/[id]/(validator-profile)/networks/validator-networks/network-view-toggle';
import ValidatorNetworksList
  from '@/app/validators/[id]/(validator-profile)/networks/validator-networks/validator-networks-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import ListFilters from '@/components/common/list-filters/list-filters';
import validatorService from '@/services/validator-service';

interface OwnProps extends PagesProps {
  id: number;
  perPage: number;
  ecosystems: string[];
  nodeStatus: string[];
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  view: string;
  networks: string[];
}

const ValidatorNetworks: FC<OwnProps> = async ({
    id,
    perPage,
    currentPage,
    ecosystems,
    nodeStatus,
    page,
    sort,
    view,
    networks,
  }) => {
  const { validatorNodesWithChainData: allNodes } = await validatorService.getValidatorNodesWithChains(id);
  const networksDropdown = Array.from(
    new Map(
      allNodes.map((n): [string, { value: string; title: string }] => [n.chain.name, {
        value: n.chain.name,
        title: n.chain.prettyName,
      }]),
    ).values(),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <NetworkViewToggle />
        <ListFilters
          perPage={perPage}
          selectedNodeStatus={nodeStatus}
          selectedEcosystems={ecosystems}
          selectedNetworks={networks}
          isEcosystems
          isNetworks
          isNodeStatus
          isNetworkStage
          isSetPositions
          networksDropdown={networksDropdown}
        />
      </div>
      <div>
        <BaseTable className="mt-4">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Network" sortField="prettyName" defaultSelected />
            <TableHeaderItem page={page} name="Rank" sortField="rank" />
            <TableHeaderItem page={page} name="Expected APR" sortField="apr" />
            <TableHeaderItem page={page} name="Fans" sortField="fans" />
            <TableHeaderItem page={page} name="Voting Power" sortField="votingPower" />
            <TableHeaderItem page={page} name="Commission" sortField="rate" />
            <TableHeaderItem page={page} name="Self Delegation" sortField="minSelfDelegation" />
            <TableHeaderItem page={page} name="Uptime" sortField="uptime" />
            <TableHeaderItem page={page} name="Missed Blocks" sortField="blocks" />
            <TableHeaderItem page={page} name="Infrastructure" />
            <TableHeaderItem page={page} name="Governance" sortField="governance" />
          </tr>
          </thead>
          <ValidatorNetworksList
            id={id}
            sort={sort}
            perPage={perPage}
            ecosystems={ecosystems}
            nodeStatus={nodeStatus}
            currentPage={currentPage}
            aggregated={view !== 'node'}
            networks={networks}
          />
        </BaseTable>
      </div>
    </div>
  );
};

export default ValidatorNetworks;
