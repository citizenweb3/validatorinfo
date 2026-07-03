'use client';

import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';

import RoundedButton from '@/components/common/rounded-button';
import WalletModal from '@/components/wallet-connect/wallet-modal';
import { useWallet } from '@/context/WalletContext';

interface OwnProps {
  children: ReactNode;
}

const ProfileGuard = ({ children }: OwnProps) => {
  const t = useTranslations('ProfilePage');
  const { walletData, isInitializing } = useWallet();
  const [isWalletModalOpened, setIsWalletModalOpened] = useState(true);

  const handleConnectClick = () => {
    setIsWalletModalOpened(true);
  };

  const handleCloseModal = () => {
    setIsWalletModalOpened(false);
  };

  if (isInitializing) return null;

  if (!walletData) {
    return (
      <div className="flex min-h-[30rem] flex-grow flex-col items-center justify-center gap-6 text-center">
        <div className="max-w-3xl px-4 font-handjet text-6xl text-highlight sm:text-4xl md:text-2xl">
          {t('LoginRequired')}
        </div>
        <RoundedButton onClick={handleConnectClick} className="text-4xl sm:text-3xl md:text-xl" contentClassName="px-12">
          {t('Connect')}
        </RoundedButton>
        <WalletModal isOpened={isWalletModalOpened} onClose={handleCloseModal} />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProfileGuard;
