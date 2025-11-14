'use client';

import { useSearchParams } from 'next/navigation';
import { FC, ReactNode } from 'react';

interface OwnProps {
  gameMode: ReactNode;
  devMode: ReactNode;
}

const ValidatorLayoutContainer: FC<OwnProps> = ({ gameMode, devMode }) => {
  const searchParams = useSearchParams();
  const currentMode = searchParams.get('mode') || 'game';

  return (
    <>
      <div style={{ display: currentMode === 'game' ? 'block' : 'none' }}>{gameMode}</div>
      <div style={{ display: currentMode === 'dev' ? 'block' : 'none' }}>{devMode}</div>
    </>
  );
};

export default ValidatorLayoutContainer;
