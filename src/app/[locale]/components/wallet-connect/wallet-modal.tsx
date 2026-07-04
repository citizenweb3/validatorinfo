import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';

import Button from '@/components/common/button';
import BaseModal from '@/components/common/modal/base-modal';
import { WALLETS } from '@/constants';
import { useWallet } from '@/context/WalletContext';
import { WalletProvider } from '@/providers';

interface OwnProps {
  isOpened: boolean;
  onClose: () => void;
}

const WalletModal: FC<OwnProps> = ({ isOpened, onClose }) => {
  const router = useRouter();
  const { refreshWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClick = async (provider: WalletProvider, extension: string) => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      await provider.enable('cosmoshub-4');
      const { wallet, walletName } = await provider.connect('cosmoshub-4');
      const { signature, key } = await provider.signProof('cosmoshub-4');

      const body = {
        key,
        signature,
        address: wallet.address,
        walletName,
        chainId: 'cosmoshub-4',
        extension,
      };

      const response = await fetch('/api/auth/wallet/', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => res.json());

      localStorage.setItem('validatorinfo.com', JSON.stringify(response.jwt));

      refreshWallet();
      onClose();
      router.push('/profile');
    } catch (error) {
      // Wallet popup rejected / signing failed / network error — reset so the user can retry.
      console.error('[wallet] connect failed:', error);
      setIsConnecting(false);
    }
  };
  return (
    <BaseModal
      title="Connect Wallet"
      isRelative={false}
      withOverlay
      opened={isOpened}
      onClose={onClose}
      className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
    >
      <div className="flex space-x-4 p-6 pt-5 text-base">
        {WALLETS.map(({ label, logo, provider }) => (
          <Button
            contentClassName="!p-4"
            key={label}
            onClick={() => handleClick(provider, label)}
            className="mb-5 flex items-center justify-between"
          >
            <Image src={`/img/icons/wallet/${logo}.svg`} alt={label} width={50} height={50} className="h-20 w-20" />
          </Button>
        ))}
      </div>
    </BaseModal>
  );
};

export default WalletModal;
