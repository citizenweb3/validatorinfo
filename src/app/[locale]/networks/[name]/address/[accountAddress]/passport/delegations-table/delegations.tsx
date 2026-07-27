import { FC, Suspense } from 'react';

import DelegationsList from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegations-list';
import DelegationsRowsSkeleton from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegations-rows-skeleton';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  chainName: string;
  accountAddress: string;
}

const Delegations: FC<OwnProps> = ({ page, chainName, accountAddress }) => {
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
        <Suspense key={`${chainName}:${accountAddress}`} fallback={<DelegationsRowsSkeleton />}>
          <DelegationsList chainName={chainName} accountAddress={accountAddress} />
        </Suspense>
      </BaseTable>
    </div>
  );
};

export default Delegations;
