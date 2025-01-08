import { FC } from 'react';

import SimpleValidatorsList from '@/app/validators/simple-validators/simple-validators-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  page: 'HomePage' | 'AboutPage' | 'ValidatorsPage' | 'ProfilePage' | 'ValidatorNetworksPage';
}

const SimpleValidators: FC<OwnProps> = async ({page, perPage, sort, currentPage }) => {
  return (
    <div>
      <ListFilters perPage={perPage} />
      <div>
        <table className="my-4 w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page={page} name="Validator" sortField="moniker" defaultSelected />
              <TableHeaderItem page={page} name="Links" colspan={3} />
            </tr>
          </thead>
          <SimpleValidatorsList perPage={perPage} sort={sort} currentPage={currentPage} />
        </table>
      </div>
    </div>
  );
};

export default SimpleValidators;
