import { FC } from 'react';

import SortButton from '@/components/common/sort-button';

interface OwnProps {}

const ValidatorListSortItems: FC<OwnProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <SortButton direction="t" />
    </div>
  );
};

export default ValidatorListSortItems;
