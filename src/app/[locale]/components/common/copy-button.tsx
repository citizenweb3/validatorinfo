'use client';

import { FC } from 'react';

type Size = 'sm' | 'base' | 'md';

const sizes: Record<Size, string> = {
  sm: 'h-5 w-5 min-h-5 min-w-5',
  base: 'h-6 w-6 min-h-6 min-w-6',
  md: 'h-8 w-8 min-h-8 min-w-8',
};

interface OwnProps {
  value: string;
  size?: Size;
}

const CopyButton: FC<OwnProps> = ({ value, size='base' }) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
  };
  return (
    <div
      onClick={handleCopy}
      className={`${sizes[size]} bg-copy hover:bg-copy_h active:bg-copy_a cursor-pointer bg-contain bg-no-repeat`}
    />
  );
};

export default CopyButton;
