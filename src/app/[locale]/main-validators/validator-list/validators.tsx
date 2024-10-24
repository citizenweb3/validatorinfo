import { FC, Suspense } from 'react';

import ValidatorsList from '@/app/main-validators/validator-list/validators-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  filterChains: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const Validators: FC<OwnProps> = async ({ sort, perPage, filterChains = [], currentPage = 1 }) => {
  return (
    <div>
      <ListFilters perPage={perPage} selectedEcosystems={filterChains} battery />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <th />
              <TableHeaderItem name="Validator" sortField="moniker" />
              <TableHeaderItem name="Links" />
              <TableHeaderItem name="Battery" />
              <TableHeaderItem name="Technical" />
              <TableHeaderItem name="Social" />
              <TableHeaderItem name="Governance" />
              <TableHeaderItem name="User" />
              <TableHeaderItem name="TVS" />
              <TableHeaderItem name="Supported Assets" sortField="nodes" />
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
            <ValidatorsList perPage={perPage} currentPage={currentPage} filterChains={filterChains} sort={sort} />
          </Suspense>
        </table>
      </div>
    </div>
  );
};

export default Validators;
