import { FC } from 'react';

import { getValidators } from '@/actions/validators';
import ValidatorListFilters from '@/app/validators/validator-list/validator-list-filters';
import ValidatorListHeaderItem from '@/app/validators/validator-list/validator-list-header-item';
import ValidatorListItem from '@/app/validators/validator-list/validator-list-item/validator-list-item';
import ValidatorListPagination from '@/app/validators/validator-list/validator-list-pagination';

interface OwnProps {
  chains: string[];
}

const ValidatorList: FC<OwnProps> = async ({ chains = [] }) => {
  const validators = await getValidators(chains);

  return (
    <div className="mt-6">
      <ValidatorListFilters chains={chains} />
      {validators.length === 0 ? (
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
                <ValidatorListHeaderItem name="Technical S." sortable />
                <ValidatorListHeaderItem name="Social S." sortable />
                <ValidatorListHeaderItem name="Governance S." sortable />
                <ValidatorListHeaderItem name="User S." sortable />
                <ValidatorListHeaderItem name="TVS" sortable />
                <ValidatorListHeaderItem name="Supported Assets" sortable />
              </tr>
            </thead>
            <tbody>
              {validators.map((item) => (
                <ValidatorListItem key={item.id} validator={item} />
              ))}
            </tbody>
          </table>
          <ValidatorListPagination />
        </div>
      )}
    </div>
  );
};

export default ValidatorList;
