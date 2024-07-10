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
  return (
    <div
      onClick={onClick}
      className={`${isOpened ? `bg-[url('/img/icons/close.svg')] group-hover/button:bg-[url('/img/icons/close-h.svg')] group-active/button:bg-[url('/img/icons/close-a.svg')] hover:bg-[url('/img/icons/close-h.svg')] active:bg-[url('/img/icons/close-a.svg')]` : `bg-[url('/img/icons/plus.svg')] group-hover/button:bg-[url('/img/icons/plus-h.svg')] group-active/button:bg-[url('/img/icons/plus-a.svg')] hover:bg-[url('/img/icons/plus-h.svg')] active:bg-[url('/img/icons/plus-a.svg')]`} ml-2 ${sizes[size]} cursor-pointer bg-contain bg-no-repeat`}
    />
  );
};

export default PlusButton;
