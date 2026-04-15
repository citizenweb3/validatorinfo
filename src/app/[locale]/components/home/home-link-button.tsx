'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';

import WalletModal from '@/components/wallet-connect/wallet-modal';
import { useWallet } from '@/context/WalletContext';

interface OwnProps {
  label: string;
  href: string;
  icon: {
    src: string;
    className: string;
  };
  external?: boolean;
  isWalletLogin?: boolean;
}

const linkClassName =
  'group flex h-32 min-w-0 items-center gap-4 overflow-hidden whitespace-nowrap border border-bgSt bg-card px-5 text-white/90 shadow-menu-button-rest transition hover:bg-card hover:text-highlight hover:shadow-menu-button-hover active:border-transparent active:bg-card active:shadow-menu-button-pressed sm:h-20 sm:gap-3 sm:px-4 md:h-10 md:gap-2 md:px-2.5';

const LinkIcon = ({ icon, alt }: { icon: OwnProps['icon']; alt: string }) => (
  <Image src={icon.src} alt={alt} width={25} height={25} className={`${icon.className} shrink-0 object-contain`} />
);

const LinkLabel = ({ label }: { label: string }) => (
  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-sfpro text-5xl font-medium tracking-normal transition-colors group-hover:text-highlight sm:text-3xl md:text-base">
    {label}
  </span>
);

const HomeLinkButton: FC<OwnProps> = ({ label, href, icon, external, isWalletLogin = false }) => {
  const router = useRouter();
  const { walletData } = useWallet();
  const [isWalletModalOpened, setIsWalletModalOpened] = useState(false);

  const handleWalletLoginClick = useCallback(() => {
    if (walletData) {
      router.push(href);
      return;
    }

    setIsWalletModalOpened(true);
  }, [href, router, walletData]);

  if (isWalletLogin) {
    return (
      <>
        <button type="button" className={linkClassName} aria-label={label} onClick={handleWalletLoginClick}>
          <LinkIcon icon={icon} alt={label} />
          <LinkLabel label={label} />
        </button>
        <WalletModal isOpened={isWalletModalOpened} onClose={() => setIsWalletModalOpened(false)} />
      </>
    );
  }

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={linkClassName}
      aria-label={label}
    >
      <LinkIcon icon={icon} alt={label} />
      <LinkLabel label={label} />
    </Link>
  );
};

export default HomeLinkButton;
