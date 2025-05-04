'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useState } from 'react';

import HeaderActionButtons from '@/components/header/header-action-buttons';
import HeaderSearch from '@/components/header/header-search/header-search';
import MenuBurgerButton from '@/components/navigation-bar/menu-burger-button';
import WalletButton from '@/components/wallet-connect/wallet-button';
import MobileNavigationBar from '@/components/navigation-bar/mobile-navigation-bar';

interface OwnProps {}

const HeaderControls: FC<OwnProps> = () => {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="ml-7 mt-3 flex h-64 flex-row items-start sm:h-36 md:mx-11 md:h-24">
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
          <div className="group-hover:text-shadowed hidden font-handjet text-lg text-highlight md:block">
            {t('Home')}
          </div>
          <Image
            src="/img/logo.svg"
            alt="validatorinfo.com logo. Futuristic robot head with a V-style tick symbol"
            width={186}
            height={174}
            className="w-64 sm:w-32 md:w-16"
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
      <div className="relative mx-1 mt-48 flex h-1 flex-grow justify-center border-white bg-gradient-to-r from-primary to-secondary shadow-line sm:mt-24 sm:h-0.5 md:mt-7 md:h-0.5">
        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -left-3 top-2/4 h-7 translate-y-[-52%] fill-primary sm:-left-1 sm:h-4 md:h-3"
        >
          <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
        </svg>

        <div>
          <HeaderSearch />
          <div className="hidden md:block">
            <HeaderActionButtons />
          </div>
        </div>

        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -right-3 top-2/4 h-7 translate-y-[-52%] rotate-180 fill-secondary sm:-right-1 sm:h-4 md:h-3"
        >
          <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
        </svg>
      </div>
      <div className="hidden md:block">
        <WalletButton />
      </div>
      <div className="block md:hidden">
        <MenuBurgerButton
          isOpened={mobileOpen}
          onToggle={() => setMobileOpen(o => !o)}
        />
      </div>
      <MobileNavigationBar
        isOpened={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </div>
  );
};

export default HeaderControls;
