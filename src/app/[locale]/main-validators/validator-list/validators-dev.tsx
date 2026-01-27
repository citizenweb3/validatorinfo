import { FC, Suspense } from 'react';

import ValidatorsList from '@/app/main-validators/validator-list/validators-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  ecosystems: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy?: string; order: SortDirection };
}

const ValidatorsDev: FC<OwnProps> = async ({ page, sort, perPage, ecosystems = [], currentPage = 1 }) => {
  return (
    <div>
      <ListFilters
        perPage={perPage}
        selectedEcosystems={ecosystems}
        isBattery
        isEcosystems />
      <div>
        <BaseTable className="my-4">
          <thead>
          <tr className="sticky top-0 z-30 w-full">
            <TableHeaderItem page={page} className="w-[20%]" name="Validator" sortField="moniker" />
            <TableHeaderItem page={page} name="Links" />
            <TableHeaderItem page={page} name="Battery" />
            <TableHeaderItem page={page} name="Technical" />
            <TableHeaderItem page={page} name="Social" />
            <TableHeaderItem page={page} name="Governance" />
            <TableHeaderItem page={page} name="User" />
            <TableHeaderItem page={page} name="TVS" />
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
            <ValidatorsList perPage={perPage} currentPage={currentPage} ecosystems={ecosystems} sort={sort} mode="dev" />
          </Suspense>
        </BaseTable>
      </div>
    </div>
  );
};

export default ValidatorsDev;
