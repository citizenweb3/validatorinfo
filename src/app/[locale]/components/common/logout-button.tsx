'use client';

import { useRouter } from 'next/navigation';
import { FC, ReactNode } from 'react';

import RoundedButton from '@/components/common/rounded-button';
import { useWallet } from '@/context/WalletContext';

interface OwnProps {
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

const LogoutButton: FC<OwnProps> = ({ className, contentClassName, children }) => {
  const { logout } = useWallet();
  const router = useRouter();

  const handleLogoutClick = () => {
    logout();
    router.push('/');
  };

  return (
    <RoundedButton className={className} contentClassName={contentClassName} onClick={handleLogoutClick}>
      {children}
    </RoundedButton>
  );
};

export default LogoutButton;
