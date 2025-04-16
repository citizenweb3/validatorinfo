import { FC } from 'react';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';
import DelegationsList from '@/app/networks/[id]/address/[accountAddress]/passport/delegations-table/delegations-list';

interface OwnProps extends PagesProps {
  chainId: number;
}

const Delegations: FC<OwnProps> = async ({ page, chainId }) => {
  return (
    <div>
      <table className="my-4 w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Validator" />
          <TableHeaderItem page={page} name="Staked Amount" />
          <TableHeaderItem page={page} name="Reward Amount" />
          <TableHeaderItem page={page} name="Reward Value" />
        </tr>
        </thead>
        <DelegationsList chainId={chainId} />
      </table>
    </div>
  );
};

export default Delegations;
