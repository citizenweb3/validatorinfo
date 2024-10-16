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

const TriangleButton: FC<OwnProps> = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${directions[direction]} h-4 w-4 cursor-pointer bg-triangle bg-contain bg-no-repeat hover:bg-triangle_h active:bg-triangle_a`}
    />
  );
};

export default TriangleButton;
