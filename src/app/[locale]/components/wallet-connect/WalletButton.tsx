'use client';

import React from 'react';

import { WALLETS } from '@/constants';
import { useWallet } from '@/context/WalletContext';

const WalletButton: React.FC = () => {
  const { walletData, refreshWallet } = useWallet();
  console.log(walletData);

  const handleClick = async () => {
    const provider = WALLETS[0].provider;
    await provider.enable('cosmoshub-4');
    const { wallet, walletName } = await provider.connect('cosmoshub-4');
    const { signature, key } = await provider.signProof('cosmoshub-4');

    const body = {
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
    }).then((res) => res.json());

    localStorage.setItem('validatorinfo.com', JSON.stringify(response.jwt));

    refreshWallet();
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
      {walletData ? walletData.name : 'Connect'}
    </button>
  );
};

export default WalletButton;
