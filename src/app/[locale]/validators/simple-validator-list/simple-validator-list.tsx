import { FC } from 'react';

import SimpleValidatorListFilters from '@/app/validators/simple-validator-list/simple-validator-list-filters';
import SimpleValidatorListItem from '@/app/validators/simple-validator-list/simple-validator-list-item';
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

const SimpleValidatorList: FC<OwnProps> = async ({
  perPage,
  validators,
  filterChains,
  chains = [],
  currentPage = 1,
}) => {
  const { validators: list, pages } = validators;

  const baseUrl = `/validators?pp=${perPage}${filterChains.length ? `&chains=${filterChains.join('&chains=')}` : ''}`;

  return (
    <div>
      <SimpleValidatorListFilters perPage={perPage} chains={filterChains} />
      {list.length === 0 ? (
        <div className="mt-6 text-base">No validators found, try to change filters!</div>
      ) : (
        <div>
          <table className="my-4 w-full table-auto border-collapse">
            <thead>
              <tr className="bg-table_header">
                <TableHeaderItem name="Validator" sortable />
                <TableHeaderItem name="Links" colspan={3} />
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <SimpleValidatorListItem key={item.operatorAddress} validator={item} chains={chains} />
              ))}
            </tbody>
          </table>
          <TablePagination baseUrl={baseUrl} currentPage={currentPage} pageLength={pages} />
        </div>
      )}
    </div>
  );
};

export default SimpleValidatorList;
