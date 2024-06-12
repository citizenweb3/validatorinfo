'use client';

import { useSearchParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import { getValidators } from '@/actions/validators';
import ValidatorListFilters from '@/app/validators/validator-list/validator-list-filters';
import ValidatorListHeaderItem from '@/app/validators/validator-list/validator-list-header-item';
import ValidatorListItem from '@/app/validators/validator-list/validator-list-item/validator-list-item';
import ValidatorListPagination from '@/app/validators/validator-list/validator-list-pagination';
import { ValidatorItem } from '@/types';

interface OwnProps {}

const ValidatorList: FC<OwnProps> = ({}) => {
  const [validators, setValidators] = useState<ValidatorItem[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const init = async () => {
      const val = await getValidators(searchParams.getAll('chains') ?? []);
      setValidators(val);
    };
    init();
  }, [searchParams]);

  return (
    <div>
      <ValidatorListFilters />
      {validators.length === 0 ? (
        <div className="mt-6 text-base">No validators found, try to change filters!</div>
      ) : (
        <div>
          <ValidatorListPagination />
          <table className="my-4 w-full table-auto border-collapse">
            <thead>
              <tr>
                <th />
                <ValidatorListHeaderItem name="Validator name" />
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
