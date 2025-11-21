'use client';

import { FC, useMemo, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';

interface OwnProps {
  text?: string | null;
  title?: string;
  readMoreLabel?: string;
  className?: string;
  minCharsToShowButton?: number;
}

const ChainDescription: FC<OwnProps> = ({ text, readMoreLabel, className, minCharsToShowButton = 50 }) => {
  const [open, setOpen] = useState(false);
  const full = useMemo(() => (text ?? '').trim(), [text]);

  const showButton = full.length > minCharsToShowButton || /\r?\n/.test(full);

  return (
    <div className={className}>
      <p className="line-clamp-2 whitespace-pre-wrap break-words">{full}</p>

      {showButton && (
        <button type="button" className="mt-1 text-sm underline hover:text-highlight" onClick={() => setOpen(true)}>
          {readMoreLabel}
        </button>
      )}

      <BaseModal
        opened={open}
        onClose={() => setOpen(false)}
        className="left-1/2 top-1/2 w-[min(90vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl p-0"
        maxHeight="max-h-[80vh]"
        copyText={full}
      >
        <p className="mx-8 my-6 whitespace-pre-wrap break-words">{full}</p>
      </BaseModal>
    </div>
  );
};

export default ChainDescription;
