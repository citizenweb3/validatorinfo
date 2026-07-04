'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { WalletVerificationResponse } from '@/api/auth/wallet/verify/route';
import { WALLETS } from '@/constants';
import { WalletProvider } from '@/providers';

interface WalletContextType {
  walletData: {
    provider: WalletProvider;
    address: string;
    name: string;
    chainId: string;
    providerName: string;
  } | null;
  isInitializing: boolean;
  refreshWallet: () => void;
  logout: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletData, setWalletData] = useState<WalletContextType['walletData']>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = () => {
    localStorage.removeItem('validatorinfo.com');
    setWalletData(null);
    setIsInitializing(false);
  };

  const refreshWallet = () => {
    const currentJwt = localStorage.getItem('validatorinfo.com');

    const verifyWallet = async () => {
      if (!currentJwt) {
        setWalletData(null);
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);

      try {
        const resp = await fetch('/api/auth/wallet/verify/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jwt: currentJwt }),
        });
        if (resp.ok) {
          const data = (await resp.json()) as WalletVerificationResponse;
          const { walletName, address, extension } = data;
          const providerEntry = WALLETS.find(({ label }) => label === extension);

          if (providerEntry) {
            setWalletData({
              provider: providerEntry.provider,
              providerName: extension,
              name: walletName,
              address: address,
              chainId: 'cosmoshub-4',
            });
          } else {
            setWalletData(null);
          }
        } else {
          console.error('Failed to verify JWT:', resp.status);
          setWalletData(null);
        }
      } catch (error) {
        console.error('Error verifying JWT:', error);
        setWalletData(null);
      } finally {
        setIsInitializing(false);
      }
    };

    verifyWallet();
  };

  useEffect(() => {
    refreshWallet(); // Проверка JWT при загрузке
  }, []);

  const value = useMemo(() => ({ walletData, isInitializing, refreshWallet, logout }), [walletData, isInitializing]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProviderComponent');
  }
  return context;
};
