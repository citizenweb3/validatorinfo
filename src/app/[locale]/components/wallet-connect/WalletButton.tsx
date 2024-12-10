'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import Tooltip from '@/components/common/tooltip';
import WalletModal from '@/components/wallet-connect/wallet-modal';
import { useWallet } from '@/context/WalletContext';

const WalletButton: React.FC = () => {
  const t = useTranslations('Header');
  const router = useRouter();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const { walletData, logout } = useWallet();

  const handleClick = async () => {
    if (walletData) {
      logout();
      router.push('/');
    } else {
      setIsOpened(true);
    }
  };

  return (
    <div className="group border border-transparent border-r-bgSt border-t-bgSt shadow-button hover:border hover:border-secondary hover:bg-[#272727] hover:text-highlight active:mt-1 active:border-transparent active:bg-background active:shadow-none">
      <Tooltip tooltip={t('Click to login')}>
        <div onClick={handleClick} className="flex flex-col items-center">
          <div className="group-hover:text-shadowed font-handjet text-lg text-highlight">{t('You')}</div>
          <Image
            src="/img/avatars/default.png"
            alt="avatar"
            width={62}
            height={58}
            className="mx-1.5 my-0.5 w-[4.2rem]"
            priority
          />
        </div>
      </Tooltip>
      <WalletModal isOpened={isOpened} onClose={() => setIsOpened(false)} />
    </div>
  );
};

export default WalletButton;
