import { FC } from 'react';

type Direction = 't' | 'b';

const directions: Record<Direction, string> = {
  b: '-mt-2.5 -mb-2',
  t: 'rotate-180 mt-0 -mb-2',
};

interface OwnProps {
  onClick?: () => void;
  direction: Direction;
}

const SortButton: FC<OwnProps> = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${directions[direction]} hover:bg-sort_h bg-sort mr-1 min-h-6 min-w-5 cursor-pointer bg-contain bg-center bg-no-repeat`}
    />
  );
};

export default SortButton;
