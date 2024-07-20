import { FC } from 'react';

import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {}

const ValidatorListSortItems: FC<OwnProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center -space-y-2">
      <TriangleButton direction="t" />
      <TriangleButton direction="b" />
    </div>
  );
};

export default ValidatorListSortItems;
