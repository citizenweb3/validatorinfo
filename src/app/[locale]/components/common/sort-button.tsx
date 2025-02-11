import { FC } from 'react';

import { SortDirection } from '@/server/types';

const directions: Record<SortDirection, string> = {
  asc: '-mt-2.5 -mb-2',
  desc: 'rotate-180 mt-0 -mb-4',
};

interface OwnProps {
  isActive: boolean;
  onClick?: () => void;
  direction: SortDirection;
}

const SortButton: FC<OwnProps> = ({ isActive, direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${directions[direction]} ${isActive ? 'bg-sort_a' : 'bg-sort'} min-h-6 min-w-5 cursor-pointer bg-sort bg-contain bg-center bg-no-repeat group-hover:bg-sort_h`}
    />
  );
};

export default SortButton;
