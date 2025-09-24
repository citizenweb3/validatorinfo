import { FC, Suspense } from 'react';

import ValidatorsList from '@/app/main-validators/validator-list/validators-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  ecosystems: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy?: string; order: SortDirection };
}

const Validators: FC<OwnProps> = async ({ page, sort, perPage, ecosystems = [], currentPage = 1 }) => {
  return (
    <div>
      <ListFilters perPage={perPage} selectedEcosystems={ecosystems} isEcosystems />
      <div>
        <table className="relative my-4 w-full table-auto border-collapse">
          <thead>
            <tr className="sticky top-0 z-30 w-full bg-table_header">
              <th />
              <TableHeaderItem page={page} className="w-[20%]" name="Validator" sortField="moniker" />
              <TableHeaderItem page={page} name="Links" />
              <TableHeaderItem page={page} name="Supported Assets" sortField="nodes" />
            </tr>
          </thead>
          <Suspense
            fallback={
              <tbody>
                <tr>
                  <td colSpan={10}>Loading......</td>
                </tr>
              </tbody>
            }
          >
            <ValidatorsList perPage={perPage} currentPage={currentPage} ecosystems={ecosystems} sort={sort} />
          </Suspense>
        </table>
      </div>
    </div>
  );
};

export default Validators;
