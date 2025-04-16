'use client';

import { FC } from 'react';

type Size = 'sm' | 'base' | 'md' | 'lg';

const sizes: Record<Size, string> = {
  sm: 'h-5 w-5 min-h-5 min-w-5',
  base: 'h-6 w-6 min-h-6 min-w-6',
  md: 'h-8 w-8 min-h-8 min-w-8',
  lg: 'h-9 w-9 min-h-9 min-w-9',
};

interface OwnProps {
  size?: Size;
}

const QrCodeButton: FC<OwnProps> = ({ size = 'base' }) => {
  return (
    <div
      className={`${sizes[size]} bg-qrcode hover:bg-qrcode_h active:bg-qrcode_a cursor-pointer bg-contain bg-no-repeat`}
    />
  );
};

export default QrCodeButton;
