import { FC } from 'react';

type Size = 'sm' | 'base';

const sizes: Record<Size, string> = {
  sm: 'h-5 w-5 min-h-5 min-w-5',
  base: 'h-8 w-8 min-h-8 min-w-8',
};

interface OwnProps {
  isOpened: boolean;
  onClick?: () => void;
  size?: Size;
}

const PlusButton: FC<OwnProps> = ({ isOpened, onClick, size = 'base' }) => {
  const styles = isOpened ? `bg-close group-hover/button:bg-close_h group-active/button:bg-close_a hover:bg-close_h active:close_a` : `bg-plus group-hover/button:bg-plus_h group-active/button:bg-plus_a hover:bg-plus_h active:bg-plus_a`
  return (
    <div
      onClick={onClick}
      className={`${styles} ml-2 ${sizes[size]} cursor-pointer bg-contain bg-no-repeat`}
    />
  );
};

export default PlusButton;
