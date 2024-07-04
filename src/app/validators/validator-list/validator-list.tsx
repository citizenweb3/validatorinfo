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
          <table className="my-4 w-full table-auto border-collapse font-retro">
            <thead>
              <tr className="border-b border-black">
                <th />
                <ValidatorListHeaderItem name="Validator" />
                <ValidatorListHeaderItem name="Links" />
                <ValidatorListHeaderItem name="Battery" />
                <ValidatorListHeaderItem name="Technical Score" />
                <ValidatorListHeaderItem name="Social Score" />
                <ValidatorListHeaderItem name="Governance Score" />
                <ValidatorListHeaderItem name="User Score" />
                <ValidatorListHeaderItem name="TVS" />
                <ValidatorListHeaderItem name="Supported Assets" />
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
