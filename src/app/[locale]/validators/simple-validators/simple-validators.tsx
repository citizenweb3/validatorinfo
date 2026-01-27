import { FC } from 'react';

import SimpleValidatorsList from '@/app/validators/simple-validators/simple-validators-list';
import ListFilters from '@/components/common/list-filters/list-filters';
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
      <ListFilters perPage={perPage} selectedEcosystems={ecosystems} isEcosystems />
      <div>
        <BaseTable className="my-4">
          <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Validator" sortField="moniker" defaultSelected />
            <TableHeaderItem page={page} name="Links" colspan={3} />
          </tr>
          </thead>
          <SimpleValidatorsList
            perPage={perPage}
            sort={sort}
            currentPage={currentPage}
            ecosystems={ecosystems} />
        </BaseTable>
      </div>
    </div>
  );
};

export default SimpleValidators;
