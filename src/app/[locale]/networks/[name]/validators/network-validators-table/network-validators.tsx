import { FC } from 'react';

import NetworkValidatorsList from '@/app/networks/[name]/validators/network-validators-table/network-validators-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  nodeStatus: string[];
  chainId: number | null;
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkValidators: FC<OwnProps> = async ({ chainId, nodeStatus, page, perPage, sort, currentPage }) => {
  return (
    <div>
      <ListFilters selectedNodeStatus={nodeStatus} perPage={perPage} isNodeStatus isSetPositions />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page={page} name="Validator" sortField="moniker" defaultSelected />
              <TableHeaderItem page={page} name="Voting Power" sortField="votingPower" />
              <TableHeaderItem page={page} name="Voting Power Active" sortField="tokens" />
              <TableHeaderItem page={page} name="Commission" sortField="rate" />
              <TableHeaderItem page={page} name="Self Delegation" sortField="minSelfDelegation" />
              <TableHeaderItem page={page} name="Uptime" />
              <TableHeaderItem page={page} name="Missed Blocks" />
              <TableHeaderItem page={page} name="Infrastructure" />
              <TableHeaderItem page={page} name="Governance" />
            </tr>
          </thead>
          <NetworkValidatorsList
            chainId={chainId}
            nodeStatus={nodeStatus}
            perPage={perPage}
            sort={sort}
            currentPage={currentPage}
          />
        </table>
      </div>
    </div>
  );
};

export default NetworkValidators;
