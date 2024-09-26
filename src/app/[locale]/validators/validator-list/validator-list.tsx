import { FC } from 'react';

import ValidatorListFilters from '@/app/validators/validator-list/validator-list-filters/validator-list-filters';
import ValidatorListHeaderItem from '@/app/validators/validator-list/validator-list-header-item';
import ValidatorListItem from '@/app/validators/validator-list/validator-list-item/validator-list-item';
import ValidatorListPagination from '@/app/validators/validator-list/validator-list-pagination';
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
                <ValidatorListHeaderItem name="Validator" sortable />
                <ValidatorListHeaderItem name="Links" />
                <ValidatorListHeaderItem name="Battery" sortable />
                <ValidatorListHeaderItem name="Technical" sortable />
                <ValidatorListHeaderItem name="Social" sortable />
                <ValidatorListHeaderItem name="Governance" sortable />
                <ValidatorListHeaderItem name="User" sortable />
                <ValidatorListHeaderItem name="TVS" sortable />
                <ValidatorListHeaderItem name="Supported Assets" sortable />
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <ValidatorListItem key={item.operatorAddress} validator={item} chains={chains} />
              ))}
            </tbody>
          </table>
          <ValidatorListPagination
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
