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
      className={`${directions[direction]} bg-triangle hover:bg-triangle_h active:bg-triangle_a h-6 w-6 cursor-pointer bg-contain bg-no-repeat`}
    />
  );
};

export default TriangleButton;
