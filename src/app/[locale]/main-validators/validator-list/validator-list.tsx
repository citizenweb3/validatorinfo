import { FC } from 'react';

import ValidatorListFilters from '@/app/main-validators/validator-list/validator-list-filters/validator-list-filters';
import ValidatorListItem from '@/app/main-validators/validator-list/validator-list-item/validator-list-item';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TablePagination from '@/components/common/table/table-pagination';
import { Chain, ValidatorItem } from '@/types';

interface OwnProps {
  chains: Chain[];
  filterChains: string[];
  validators: { validators: ValidatorItem[]; pages: number };
  currentPage?: number;
  perPage: number;
}

const ValidatorList: FC<OwnProps> = async ({ perPage, validators, filterChains, chains = [], currentPage = 1 }) => {
  const { validators: list, pages } = validators;
  return (
    <div>
      <ValidatorListFilters perPage={perPage} chains={filterChains} />
      {list.length === 0 ? (
        <div className="mt-6 text-base">No validators found, try to change filters!</div>
      ) : (
        <div>
          <table className="my-4 w-full table-auto border-collapse">
            <thead>
              <tr className="bg-table_header">
                <th />
                <TableHeaderItem name="Validator" sortable />
                <TableHeaderItem name="Links" />
                <TableHeaderItem name="Battery" sortable />
                <TableHeaderItem name="Technical" sortable />
                <TableHeaderItem name="Social" sortable />
                <TableHeaderItem name="Governance" sortable />
                <TableHeaderItem name="User" sortable />
                <TableHeaderItem name="TVS" sortable />
                <TableHeaderItem name="Supported Assets" sortable />
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <ValidatorListItem key={item.operatorAddress} validator={item} chains={chains} />
              ))}
            </tbody>
          </table>
          <TablePagination
            baseUrl={filterChains.length ? `?chains=${filterChains.join('&chains=')}` : ''}
            currentPage={currentPage}
            pageLength={pages}
          />
        </div>
      )}
    </div>
  );
};

export default ValidatorList;
