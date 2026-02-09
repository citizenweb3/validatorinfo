'use client';

import { FC, useMemo, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';

interface OwnProps {
  shortDescription?: string | null;
  description?: string | null;
  readMoreLabel?: string;
  className?: string;
}

const ChainDescription: FC<OwnProps> = ({ shortDescription, description, readMoreLabel, className }) => {
  const [open, setOpen] = useState(false);

  const shortText = useMemo(() => (shortDescription ?? '').trim(), [shortDescription]);
  const fullText = useMemo(() => (description ?? '').trim(), [description]);

  const showButton = fullText.length > 0;

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap break-words">{shortText}</p>

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
        copyText={fullText}
      >
        <p className="mx-8 my-6 whitespace-pre-wrap break-words">{fullText}</p>
      </BaseModal>
    </div>
  );
};

export default ChainDescription;
