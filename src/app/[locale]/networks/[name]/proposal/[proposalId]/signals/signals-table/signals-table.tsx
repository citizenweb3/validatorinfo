import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import SignalsTableList from './signals-table-list';

interface OwnProps {
  chainName: string;
  payload: string;
  sort: { sortBy: string; order: SortDirection };
  perPage: number;
  currentPage: number;
}

const SignalsTable: FC<OwnProps> = async ({ chainName, payload, sort, perPage, currentPage }) => {
  return (
    <div className="mt-4">
      <BaseTable>
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page="ProposalPage" name="Provider" sortField="signaler" />
          <TableHeaderItem page="ProposalPage" name="Sequencer" />
          <TableHeaderItem page="ProposalPage" name="Round" />
          <TableHeaderItem page="ProposalPage" name="Time" sortField="timestamp" defaultSelected />
        </tr>
        </thead>
        <SignalsTableList
          chainName={chainName}
          payload={payload}
          sort={sort}
          perPage={perPage}
          currentPage={currentPage}
        />
      </BaseTable>
    </div>
  );
};

export default SignalsTable;
