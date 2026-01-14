import { FC } from 'react';

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
      <table className="w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page="ProposalPage" name="Sequencer" sortField="signaler" />
          <TableHeaderItem page="ProposalPage" name="Round" sortField="round" />
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
      </table>
    </div>
  );
};

export default SignalsTable;
