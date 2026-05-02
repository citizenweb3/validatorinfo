'use client';

import { useSearchParams } from 'next/navigation';
import { FC, ReactNode } from 'react';

interface OwnProps {
  simpleMode: ReactNode;
  devMode: ReactNode;
}

const ValidatorsLayoutContainer: FC<OwnProps> = ({ simpleMode, devMode }) => {
  const searchParams = useSearchParams();
  const currentMode = searchParams.get('mode') || 'simple';

  return (
    <>
      <div style={{ display: currentMode === 'simple' ? 'block' : 'none' }}>{simpleMode}</div>
      <div style={{ display: currentMode === 'dev' ? 'block' : 'none' }}>{devMode}</div>
    </>
  );
};

export default ValidatorsLayoutContainer;
