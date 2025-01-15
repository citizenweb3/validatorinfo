import { FC } from 'react';

type Size = 'sm' | 'base' | 'md';

const sizes: Record<Size, string> = {
  sm: 'h-5 w-5 min-h-5 min-w-5',
  base: 'h-6 w-6 min-h-6 min-w-6',
  md: 'h-10 w-10 min-h-10 min-w-10',
};

interface OwnProps {
  isOpened: boolean;
  onClick?: () => void;
  size?: Size;
}

const ArrowsGoBigButton: FC<OwnProps> = ({ isOpened, onClick, size = 'base' }) => {
  const styles = isOpened
    ? `bg-go_big hover:bg-go_big_h active:bg-go_big_a`
    : `bg-go_big hover:bg-go_big_h active:bg-go_big_a`;

  return <div onClick={onClick} className={`${styles} ${sizes[size]} cursor-pointer bg-contain bg-no-repeat`} />;
};

export default ArrowsGoBigButton;
