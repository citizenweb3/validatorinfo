'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import Tooltip from '@/components/common/tooltip';
import WalletModal from '@/components/wallet-connect/wallet-modal';
import { useWallet } from '@/context/WalletContext';

const WalletButton: React.FC = () => {
  const t = useTranslations('Header');
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const { walletData } = useWallet();

  const handleClick = async (e: any) => {
    if (!walletData) {
      e.preventDefault();
      setIsOpened(true);
      return false;
    }
  };

  return (
    <div className="group border border-transparent border-r-bgSt border-t-bgSt shadow-button hover:border hover:border-secondary hover:bg-[#272727] hover:text-highlight active:mt-1 active:border-transparent active:bg-background active:shadow-none">
      <Tooltip tooltip={walletData ? t('Profile') : t('Click to login')}>
        <Link href="/profile" onClick={handleClick} className="flex flex-col items-center">
          <div className="group-hover:text-shadowed font-handjet text-lg text-highlight">{t('You')}</div>
          <Image
            src="/img/avatars/default.png"
            alt="validatorinfo.com web3 login button. User personalized avatar"
            width={62}
            height={58}
            className="mx-1.5 my-0.5 w-[4.2rem]"
            priority
          />
        </Link>
      </Tooltip>
      <WalletModal isOpened={isOpened} onClose={() => setIsOpened(false)} />
    </div>
  );
};

export default WalletButton;
