import { FC } from 'react';

export type Size = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, string> = {
  xs: 'h-5 w-5 min-h-5 min-w-5',
  sm: 'h-6 w-6 min-h-6 min-w-6',
  base: 'h-8 w-8 min-h-8 min-w-8',
  md: 'h-10 w-10 min-h-10 min-w-10',
  lg: 'h-20 w-20 min-h-20 min-w-20',
  xl: 'h-24 w-24 min-h-24 min-w-24',
};

interface OwnProps {
  isOpened: boolean;
  onClick?: () => void;
  size?: Size;
}

const PlusButton: FC<OwnProps> = ({ isOpened, onClick, size = 'base' }) => {
  const styles = isOpened
    ? `bg-close group-hover/button:bg-close_h group-active/button:bg-close_a hover:bg-close_h active:close_a`
    : `bg-plus group-hover/button:bg-plus_h group-active/button:bg-plus_a hover:bg-plus_h active:bg-plus_a`;
  return <div onClick={onClick} className={`${styles} ${sizes[size]} cursor-pointer bg-contain bg-no-repeat`} />;
};

export default PlusButton;
