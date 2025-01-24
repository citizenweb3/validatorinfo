'use client';

import { FC } from 'react';

interface OwnProps {
  value: string;
}

const CopyButton: FC<OwnProps> = ({ value }) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
  };
  return (
    <div
      onClick={handleCopy}
      className="bg-copy hover:bg-copy_h active:bg-copy_a cursor-pointer bg-contain bg-no-repeat h-10 w-10 min-h-10 min-w-10"
    />
  );
};

export default CopyButton;
