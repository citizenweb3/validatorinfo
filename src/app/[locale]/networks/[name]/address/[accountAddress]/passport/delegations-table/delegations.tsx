import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';
import DelegationsList from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegations-list';

interface OwnProps extends PagesProps {
  chainName: string;
}

const Delegations: FC<OwnProps> = async ({ page, chainName }) => {
  return (
    <div>
      <BaseTable className="my-4">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Validator" />
          <TableHeaderItem page={page} name="Staked Amount" />
          <TableHeaderItem page={page} name="Reward Amount" />
          <TableHeaderItem page={page} name="Reward Value" />
        </tr>
        </thead>
        <DelegationsList chainName={chainName} />
      </BaseTable>
    </div>
  );
};

export default Delegations;
