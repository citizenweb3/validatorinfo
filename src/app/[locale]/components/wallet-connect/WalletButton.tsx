// components/WalletButton.tsx
'use client';

// Указываем, что это клиентский компонент
import React from 'react';

import { WalletProof } from '@/api/auth/wallet/route';
import { WALLETS } from '@/constants';

// components/WalletButton.tsx

// components/WalletButton.tsx

// components/WalletButton.tsx

// components/WalletButton.tsx

// components/WalletButton.tsx

const WalletButton: React.FC = () => {
  const handleClick = async () => {
    const provider = WALLETS[0].provider;
    const { wallet, walletName } = await provider.connect('cosmoshub-4');
    const { signature, key } = await provider.signProof('cosmoshub-4');

    const body: WalletProof = {
      key,
      signature,
      address: wallet.address,
      walletName,
      chainId: 'cosmoshub-4',
      extension: WALLETS[0].label,
    };

    const response = await fetch('/api/auth/wallet/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(response);
  };

  return (
    <button
      style={{
        margin: '10px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        color: 'black',
        fontSize: '16px',
      }}
      onClick={handleClick}
    >
      Connect
    </button>
  );
};

export default WalletButton;
