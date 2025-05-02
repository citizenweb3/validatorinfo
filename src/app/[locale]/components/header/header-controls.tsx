'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import HeaderActionButtons from '@/components/header/header-action-buttons';
import HeaderSearch from '@/components/header/header-search/header-search';
import WalletButton from '@/components/wallet-connect/wallet-button';
import MenuBurgerButton from '@/components/navigation-bar/menu-burger-button';

interface OwnProps {}

const HeaderControls: FC<OwnProps> = () => {
  const t = useTranslations('Header');
  const pathname = usePathname();

  return (
    <div className="sm:mx-11 ml-7 mt-3 flex sm:h-24 h-64 flex-row items-start">
      <Link
        href="/"
        onClick={() => {
          if (pathname === '/') {
            window.location.reload();
          }
        }}
        className="group cursor-pointer border border-transparent border-r-bgSt border-t-bgSt shadow-button hover:border hover:border-bgSt hover:bg-[#272727] hover:text-highlight active:mt-1 active:border-transparent active:bg-background active:shadow-none"
      >
        <div className="relative flex flex-col items-center px-2 py-1">
          <div className="sm:block hidden group-hover:text-shadowed font-handjet text-lg text-highlight">{t('Home')}</div>
          <Image
            src="/img/logo.svg"
            alt="validatorinfo.com logo. Futuristic robot head with a V-style tick symbol"
            width={186}
            height={174}
            className="sm:w-16 w-64"
            priority
          />
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
      <div className="relative mx-1 sm:mt-7 mt-48 flex sm:h-0.5 h-1 flex-grow justify-center border-white bg-gradient-to-r from-primary to-secondary shadow-line">
        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute sm:-left-1 -left-3 top-2/4 sm:h-3 h-7 translate-y-[-52%] fill-primary"
        >
          <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
        </svg>

        <div>
          <HeaderSearch />
          <div className="hidden sm:block">
            <HeaderActionButtons />
          </div>
        </div>

        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute sm:-right-1 -right-3 top-2/4 sm:h-3 h-7 translate-y-[-52%] rotate-180 fill-secondary"
        >
          <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
        </svg>
      </div>
      <div className="hidden sm:block">
        <WalletButton />
      </div>
      <div className="block sm:hidden">
        <MenuBurgerButton />
      </div>
    </div>
  );
};

export default HeaderControls;
