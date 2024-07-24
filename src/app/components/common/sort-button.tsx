import { FC } from 'react';

type Direction = 'l' | 'r' | 't' | 'b';

const directions: Record<Direction, string> = {
  r: '-rotate-90',
  b: '',
  t: 'rotate-180',
  l: 'rotate-90',
};

interface OwnProps {
  onClick?: () => void;
  direction: Direction;
}

const SortButton: FC<OwnProps> = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${directions[direction]} bg-triangle_w -mb-2 -mt-3 h-8 w-8 cursor-pointer bg-contain bg-no-repeat hover:bg-triangle_h active:bg-triangle_a`}
    />
  );
};

export default SortButton;
