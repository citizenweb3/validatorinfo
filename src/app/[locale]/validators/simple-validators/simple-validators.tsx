import { FC } from 'react';

import SimpleValidatorsList from '@/app/validators/simple-validators/simple-validators-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  ecosystems: string[];
}

const SimpleValidators: FC<OwnProps> = async ({ page, perPage, sort, currentPage, ecosystems }) => {
  return (
    <div>
      <BaseTable className="mb-4">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Validator" sortField="moniker" defaultSelected />
          <TableHeaderItem page={page} name="Links" />
          <TableHeaderItem page={page} name="Supported Assets" sortField="nodes" />
        </tr>
        </thead>
        <SimpleValidatorsList
          perPage={perPage}
          sort={sort}
          currentPage={currentPage}
          ecosystems={ecosystems} />
      </BaseTable>
    </div>
  );
};

export default SimpleValidators;
