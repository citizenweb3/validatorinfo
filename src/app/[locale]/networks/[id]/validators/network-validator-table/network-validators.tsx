import { FC } from 'react';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';
import NetworkValidatorsList from '@/app/networks/[id]/validators/network-validator-table/network-validators-list';
import NetworkValidatorsListFilters
  from '@/app/networks/[id]/validators/network-validator-table/network-validators-list-filters';
import { SortDirection } from '@/server/types';


interface OwnProps extends PagesProps {
  nodeStatus: string[];
  chainId: number;
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkValidators: FC<OwnProps> = async ({ chainId, nodeStatus, page, perPage, sort, currentPage }) => {
  return (
    <div>
      <NetworkValidatorsListFilters selectedNodeStatus={nodeStatus} />
      <div>
        <table className="my-4 border-collapse w-full table-auto">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Validator" sortField="moniker" defaultSelected />
            <TableHeaderItem page={page} name="Voting Power" sortField="delegatorShares" />
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
            currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default NetworkValidators;
