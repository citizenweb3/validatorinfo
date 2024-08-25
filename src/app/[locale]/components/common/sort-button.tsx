import { FC } from 'react';

type Direction = 't' | 'b';

const directions: Record<Direction, string> = {
  b: '-mt-2.5 -mb-2',
  t: 'rotate-180 mt-0 -mb-4',
};

interface OwnProps {
  onClick?: () => void;
  direction: Direction;
}

const SortButton: FC<OwnProps> = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${directions[direction]} min-h-6 min-w-5 cursor-pointer bg-sort bg-contain bg-center bg-no-repeat hover:bg-sort_h`}
    />
  );
};

export default SortButton;
