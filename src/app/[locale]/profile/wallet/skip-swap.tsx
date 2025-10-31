'use client';

import { Widget } from '@skip-go/widget';
import React, { FC, useEffect, useState } from 'react';

const SkipSwap: FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setIsClient(true);
    setApiUrl(`${window.location.origin}/api/skip`);
  }, []);

  if (!isClient || !apiUrl) {
    return (
      <div className="text-neutral-400 mx-auto mt-10 w-full max-w-4xl font-sfpro text-lg text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Skip swap widget" tabIndex={0} className="mx-auto mt-4 w-full max-w-2xl">
      <div className="w-full">
        <Widget apiUrl={apiUrl} theme="dark" brandColor="#07bc0c" />
      </div>
    </div>
  );
};

export default SkipSwap;
