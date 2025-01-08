import { FC } from 'react';

import ValidatorNetworksList from '@/app/validators/[validatorIdentity]/networks/validator-networks/validator-networks-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorNetworks: FC<OwnProps> = async ({ page, perPage, sort, currentPage }) => {
  return (
    <div>
      <ListFilters perPage={perPage} />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page={page} name="Network" sortField="name" defaultSelected />
              <TableHeaderItem page={page} name="Expected APR" sortField="apr" />
              <TableHeaderItem page={page} name="Fans" sortField="fans" />
              <TableHeaderItem page={page} name="Rank" sortField="rank" />
              <TableHeaderItem page={page} name="Voting Power" sortField="delegator_shares" />
              <TableHeaderItem page={page} name="Commission" sortField="rate" />
              <TableHeaderItem page={page} name="Self Delegation" sortField="min_self_delegation" />
              <TableHeaderItem page={page} name="Uptime" sortField="uptime" />
              <TableHeaderItem page={page} name="Missed Blocks" sortField="missedBlocks" />
              <TableHeaderItem page={page} name="Infrastructure" />
              <TableHeaderItem page={page} name="Governance" sortField="governance" />
            </tr>
          </thead>
          <ValidatorNetworksList perPage={perPage} sort={sort} currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default ValidatorNetworks;
