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
      className={`${directions[direction]} md:h-4 md:w-4 w-16 h-16 cursor-pointer bg-triangle bg-contain bg-no-repeat group-hover:bg-triangle_h hover:bg-triangle_h active:bg-triangle_a`}
    />
  );
};

export default TriangleButton;
