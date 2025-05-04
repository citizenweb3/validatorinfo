'use client';

import Image from 'next/image';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface OwnProps {
  isOpened: boolean;
  onToggle: () => void;
}

const MenuBurgerButton: FC<OwnProps> = ({ isOpened, onToggle }) => {
  const base = 'group shadow-button hover:bg-[#272727] hover:text-highlight active:mt-1 active:bg-background active:shadow-none';
  const opened = 'border border-secondary active:border-transparent';
  const closed = 'border border-transparent border-r-bgSt border-t-bgSt hover:border hover:border-secondary active:border-transparent';

  return (
    <div
      onClick={onToggle}
      className={twMerge(base, isOpened ? opened : closed, 'md:hidden')}
    >
      <Image
        src="/img/icons/navbar/burger-menu.png"
        alt="Burger Menu Button"
        width={50}
        height={50}
        className="sm:w-32 md:w-16 w-60"
        priority
      />
    </div>
  );
};

export default MenuBurgerButton;
