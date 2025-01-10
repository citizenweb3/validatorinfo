import { FC } from 'react';

import ValidatorNetworksList from '@/app/validators/[identity]/networks/validator-networks/validator-networks-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';
import { PagesProps } from '@/types';
import ValidatorNetworksListFilters
  from '@/app/validators/[identity]/networks/validator-networks/validator-networks-filters/validator-networks-list-filters';

interface OwnProps extends PagesProps {
  identity: string;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorNetworks: FC<OwnProps> = async ({ identity, page, sort }) => {
  return (
    <div>
      <ValidatorNetworksListFilters />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page={page} name="Network" sortField="prettyName" defaultSelected />
              <TableHeaderItem page={page} name="Expected APR" />
              <TableHeaderItem page={page} name="Fans" />
              <TableHeaderItem page={page} name="Rank" />
              <TableHeaderItem page={page} name="Voting Power" sortField="delegator_shares" />
              <TableHeaderItem page={page} name="Commission" sortField="rate" />
              <TableHeaderItem page={page} name="Self Delegation" sortField="min_self_delegation" />
              <TableHeaderItem page={page} name="Uptime" />
              <TableHeaderItem page={page} name="Missed Blocks" />
              <TableHeaderItem page={page} name="Infrastructure" />
              <TableHeaderItem page={page} name="Governance" />
            </tr>
          </thead>
          <ValidatorNetworksList identity={identity} sort={sort} />
        </table>
      </div>
    </div>
  );
};

export default ValidatorNetworks;
