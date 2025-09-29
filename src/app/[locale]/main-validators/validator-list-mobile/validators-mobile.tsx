import { FC, Suspense } from 'react';

import ValidatorsListMobile from '@/app/main-validators/validator-list-mobile/validator-list-item-mobile/validator-list-mobile';
import ListFiltersMobile from '@/components/common/list-filters/list-filters-mobile';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  ecosystems: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy?: string; order: SortDirection };
}

const ValidatorsMobile: FC<OwnProps> = async ({ page, sort, perPage, ecosystems = [], currentPage = 1 }) => {
  return (
    <div className="mr-6">
      <ListFiltersMobile perPage={perPage} selectedEcosystems={ecosystems} isEcosystems />
      <table className="relative my-4 w-full table-auto border-collapse">
        <thead>
          <tr className="sticky top-0 z-30 w-full bg-table_header">
            <TableHeaderItem page={page} className="w-[75%]" name="Validator" sortField="moniker" />
            <TableHeaderItem page={page} name="Links" className="md:hidden" />
          </tr>
        </thead>
        <Suspense
          fallback={
            <tbody>
              <tr>
                <td colSpan={7}>Loading......</td>
              </tr>
            </tbody>
          }
        >
          <ValidatorsListMobile perPage={perPage} currentPage={currentPage} ecosystems={ecosystems} sort={sort} />
        </Suspense>
      </table>
    </div>
  );
};

export default ValidatorsMobile;
