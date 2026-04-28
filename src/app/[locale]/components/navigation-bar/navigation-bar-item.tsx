'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC, MouseEvent, useState } from 'react';

import { TabOptions } from '@/components/common/tabs/tabs-data';
import WalletModal from '@/components/wallet-connect/wallet-modal';
import { AI_CHAT_OPEN_EVENT, AiChatOpenEventDetail } from '@/components/ai-chat/ai-explain-button';
import { useWallet } from '@/context/WalletContext';
import { emitWindowEvent } from '@/hooks/useWindowEvent';
import { usePathname } from '@/i18n';

interface OwnProps {
  item: TabOptions;
  isOpened: boolean;
  highlighted?: boolean;
}

const menuButtonRaisedShadow = 'shadow-menu-button-hover';
const menuButtonSelectedShadow = 'shadow-menu-button-rest';
const menuButtonHoverShadow = 'hover:shadow-menu-button-hover';
const menuButtonPressedShadow = 'active:shadow-menu-button-pressed';

const isRouteActive = (pathname: string, href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

const NavigationBarItem: FC<OwnProps> = ({ item: { name, href, icon, iconHovered }, isOpened, highlighted }) => {
  const pathname = usePathname();
  const isActive = isRouteActive(pathname, href);
  const t = useTranslations('Navbar');
  const { walletData } = useWallet();
  const [isWalletModalOpened, setIsWalletModalOpened] = useState(false);

  const isHighlighted = isActive || highlighted;
  const isWalletLogin = href === '/profile';
  const isAiLink = href === '/ai';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAiLink) {
      event.preventDefault();
      emitWindowEvent<AiChatOpenEventDetail>(AI_CHAT_OPEN_EVENT, { message: '' });
      return;
    }

    if (!isWalletLogin || walletData) {
      return;
    }

    event.preventDefault();
    setIsWalletModalOpened(true);
  };

  return (
    <>
      <Link
        href={href}
        data-active={isHighlighted ? 'true' : undefined}
        aria-current={isActive ? 'page' : undefined}
        onClick={handleClick}
        className={`${
          isOpened ? 'min-h-44 sm:min-h-24 md:h-10 md:min-h-10 md:w-navigation-open' : 'h-10 w-10'
        } ${
          isHighlighted
            ? `border border-bgSt bg-card text-highlight ${menuButtonSelectedShadow}`
            : `border-r border-t border-bgSt bg-table_row ${menuButtonRaisedShadow}`
        } ${menuButtonHoverShadow} ${menuButtonPressedShadow} group relative flex cursor-pointer flex-col items-center overflow-hidden p-0.5 text-sm transition-width duration-300 hover:bg-card hover:text-highlight active:border-transparent active:bg-card`}
      >
        {isOpened ? (
          <div
            className="relative flex h-full w-full flex-grow flex-row flex-nowrap items-center overflow-hidden text-base font-semibold leading-none group-hover:text-highlight"
          >
            <div className="absolute md:left-5 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
              {icon && (
                <Image
                  src={icon}
                  alt={name}
                  width={120}
                  height={120}
                  priority
                  className="min-w-32 max-w-32 object-contain sm:min-w-16 sm:max-w-16 md:min-w-10 md:max-w-10"
                />
              )}
            </div>
            <div
              className={`${isActive ? 'block' : 'hidden group-hover:block'} absolute md:left-5 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform`}
            >
              {iconHovered && (
                <Image
                  src={iconHovered}
                  alt={name}
                  width={120}
                  height={120}
                  priority
                  className="min-w-32 max-w-32 object-contain sm:min-w-16 sm:max-w-16 md:min-w-10 md:max-w-10"
                />
              )}
            </div>
            <div
              className={`${
                isHighlighted ? 'text-highlight' : ''
              } ml-36 text-nowrap font-handjet text-7xl tracking-wide group-hover:text-highlight sm:ml-20 sm:text-5xl md:ml-14 md:text-lg`}
            >
              {t(name as 'Validators')}
            </div>
          </div>
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            {icon && (
              <Image
                src={icon}
                alt={name}
                width={120}
                height={120}
                priority
                className={`${isActive ? 'hidden' : 'block group-hover:hidden'} h-8 w-8 object-contain`}
              />
            )}
            {iconHovered && (
              <Image
                src={iconHovered}
                alt={name}
                width={120}
                height={120}
                priority
                className={`${isActive ? 'block' : 'hidden group-hover:block'} h-8 w-8 object-contain`}
              />
            )}
          </div>
        )}
      </Link>
      {isWalletLogin && <WalletModal isOpened={isWalletModalOpened} onClose={() => setIsWalletModalOpened(false)} />}
    </>
  );
};

export default NavigationBarItem;
