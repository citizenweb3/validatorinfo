import { FC } from 'react';

import ValidatorListSortItems from '@/app/validators/validator-list/validator-list-sort-items';

interface OwnProps {
  name: string;
}

const ValidatorListHeaderItem: FC<OwnProps> = ({ name }) => {
  return (
    <th>
      <div className="flex flex-row items-center justify-center">
        <div className="text-wrap px-2 text-base">{name}</div>
        <ValidatorListSortItems />
      </div>
    </th>
  );
};

export default ValidatorListHeaderItem;
