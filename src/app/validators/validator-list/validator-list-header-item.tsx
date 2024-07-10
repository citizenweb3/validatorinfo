import { FC } from 'react';

import ValidatorListSortItems from '@/app/validators/validator-list/validator-list-sort-items';
import InfoButton from '@/components/common/info-button';

interface OwnProps {
  name: string;
}

const ValidatorListHeaderItem: FC<OwnProps> = ({ name }) => {
  return (
    <th>
      <div className="flex flex-row items-center justify-center">
        <ValidatorListSortItems />
        <div className="w-fit text-wrap pl-2 text-sm">
          {name.split(' ').map((word) => (
            <div key={word} className="break-words">
              {word}
            </div>
          ))}
        </div>
        <InfoButton />
      </div>
    </th>
  );
};

export default ValidatorListHeaderItem;
