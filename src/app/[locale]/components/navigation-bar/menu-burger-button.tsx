'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const MenuBurgerButton: React.FC = () => {
  const t = useTranslations('Header');
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const baseButtonStyle = 'group shadow-button hover:bg-[#272727] hover:text-highlight active:mt-1 active:bg-background active:shadow-none';
  const openedButtonStyle = 'border border-secondary active:border-transparent';
  const closedButtonStyle = 'border border-transparent border-r-bgSt border-t-bgSt hover:border hover:border-secondary active:border-transparent';
  const buttonClassName = twMerge(baseButtonStyle, isOpened ? openedButtonStyle : closedButtonStyle);

  return (
    <div className={buttonClassName}>
      <Image
        src="/img/icons/navbar/burger-menu.png"
        alt="Burger Menu Button"
        width={50}
        height={50}
        className="w-60"
        priority
      />
    </div>
  );
};

export default MenuBurgerButton;
