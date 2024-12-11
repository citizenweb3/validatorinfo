'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import HeaderActionButtons from '@/components/header/header-action-buttons';
import HeaderSearch from '@/components/header/header-search';
import WalletButton from '@/components/wallet-connect/WalletButton';

interface OwnProps {}

const HeaderControls: FC<OwnProps> = () => {
  const t = useTranslations('Header');
  return (
    <div className="mx-11 mt-3 flex h-24 flex-row items-start">
      <Link
        href="/"
        className="group border border-transparent border-r-bgSt border-t-bgSt shadow-button hover:border hover:border-bgSt hover:bg-[#272727] hover:text-highlight active:mt-1 active:border-transparent active:bg-background active:shadow-none"
      >
        <div className="relative flex flex-col items-center px-2 py-1">
          <div className="group-hover:text-shadowed font-handjet text-lg text-highlight">{t('Home')}</div>
          <Image src="/img/logo.svg" alt="logo" width={186} height={174} className="w-16" priority />
          <Image
            src="/img/icons/alpha.svg"
            alt="logo"
            width={68}
            height={55}
            className="absolute -bottom-6 -right-7 w-[4.5rem]"
            priority
          />
        </div>
      </Link>
      <div className="relative mx-1 mt-7 flex h-0.5 flex-grow justify-center border-white bg-gradient-to-r from-primary to-secondary shadow-line">
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
      <WalletButton />
    </div>
  );
};

export default HeaderControls;
