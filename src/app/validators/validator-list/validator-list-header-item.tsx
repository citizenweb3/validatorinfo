import { FC } from 'react';

import ValidatorListSortItems from '@/app/validators/validator-list/validator-list-sort-items';
import InfoButton from '@/components/common/info-button';

interface OwnProps {
  name: string;
  sortable?: boolean;
}

const ValidatorListHeaderItem: FC<OwnProps> = ({ name, sortable = false }) => {
  return (
    <th>
      <div className="flex flex-row items-center justify-center">
        {sortable && <ValidatorListSortItems />}
        <div className="w-fit text-wrap text-sm">
          <div className="text-nowrap font-normal">{name}</div>
        </div>
        <InfoButton />
      </div>
    </th>
  );
};

export default ValidatorListHeaderItem;
