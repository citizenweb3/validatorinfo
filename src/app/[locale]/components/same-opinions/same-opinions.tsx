import { FC } from 'react';

import SameOpinionsList from '@/components/same-opinions/same-opinions-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  operatorAddress: string;
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const SameOpinions: FC<OwnProps> = ({ operatorAddress, page, perPage, sort, currentPage }) => {
  return (
    <BaseTable className="my-4">
      <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Validator" />
          <TableHeaderItem page={page} name="Matched Votes" sortField="match" />
          <TableHeaderItem page={page} name="Common Proposals" sortField="common" />
          <TableHeaderItem page={page} name="Wilson Score" sortField="score" defaultSelected defaultOrder="desc" />
        </tr>
      </thead>
      <SameOpinionsList operatorAddress={operatorAddress} perPage={perPage} sort={sort} currentPage={currentPage} />
    </BaseTable>
  );
};

export default SameOpinions;
