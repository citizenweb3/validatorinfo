'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import HeaderActionButtons from '@/app/components/header/header-action-buttons';
import HeaderSearch from '@/app/components/header/header-search';

interface OwnProps {}

const HeaderControls: FC<OwnProps> = () => {
  return (
    <div className="mx-11 mt-3 flex h-24 flex-row items-center">
      <Link
        href="/"
        className="group border-r border-t border-bgSt shadow-button hover:bg-[#272727] hover:text-highlight hover:shadow-button-highlight active:mt-1 active:border-transparent active:bg-background active:shadow-none"
      >
        <div className="flex flex-col items-center px-2 py-1">
          <div className="group-hover:text-shadowed text-sm text-highlight">Home</div>
          <Image src="/img/logo.svg" alt="logo" width={62} height={58} className="w-16" priority />
        </div>
      </Link>
      <div className="relative mx-1 flex h-0.5 flex-grow justify-center border-white bg-gradient-to-r from-primary to-secondary shadow-line">
        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -left-1 top-2/4 h-3 translate-y-[-52%] fill-primary"
        >
          <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
        </svg>

        <div>
          <HeaderSearch />
          <HeaderActionButtons />
        </div>

        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -right-1 top-2/4 h-3 translate-y-[-52%] rotate-180 fill-secondary"
        >
          <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
        </svg>
      </div>
      <div className="group border border-transparent border-r-bgSt border-t-bgSt shadow-button hover:border hover:border-secondary hover:bg-[#272727] hover:text-highlight hover:shadow-button-greenlight active:mt-1 active:border-transparent active:bg-background active:shadow-none">
        <div className="flex flex-col items-center">
          <div className="group-hover:text-shadowed text-sm text-highlight">You</div>
          <Image
            src="/img/avatars/default.png"
            alt="avatar"
            width={62}
            height={58}
            className="mx-2 my-1.5 w-16"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderControls;
