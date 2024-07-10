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
      className={`${directions[direction]} h-6 w-6 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain bg-no-repeat hover:bg-[url('/img/icons/triangle-h.svg')] active:bg-[url('/img/icons/triangle-a.svg')]`}
    />
  );
};

export default TriangleButton;
