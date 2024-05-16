'use client';

import Image from 'next/image';
import { FC } from 'react';

import HeaderActionButtons from '@/app/components/header/header-action-buttons';
import HeaderSearch from '@/app/components/header/header-search';

interface OwnProps {}

const HeaderControls: FC<OwnProps> = ({}) => {
  return (
    <div className="mx-11 flex flex-row items-center">
      <div className="border-hover-primary shadow-3xl shadow-primary">
        <div className="flex flex-col items-center border border-primary">
          <div className="text-shadowed text-highlight">Home</div>
          <Image src="/img/logo.svg" alt="logo" width={71} height={65} />
        </div>
      </div>
      <div className="relative mx-1 flex h-0.5 flex-grow justify-center border-white bg-gradient-to-r from-primary to-secondary">
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
      <div className="border-hover-secondary shadow-3xl shadow-secondary">
        <div className="flex flex-col items-center border border-secondary">
          <div className="text-shadowed text-highlight">You</div>
          <Image src="/img/avatars/default.png" alt="avatar" width={62} height={58} className="mx-2 my-1.5" />
        </div>
      </div>
    </div>
  );
};

export default HeaderControls;
