'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'usehooks-ts';

import BaseModal from '@/components/common/modal/base-modal';

interface OwnProps {
  data?: {
    name: string;
    href: string;
  }[];
  copy?: boolean;
}

const CheckMark: FC<OwnProps> = ({ data, copy }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const [copiedText, copyToClipboard] = useCopyToClipboard();

  return (
    <>
      <Image
        onClick={() => setIsModalOpened(!isModalOpened)}
        src="/img/icons/staking-check-mark.png"
        alt="check mark"
        width={152}
        height={130}
        className="mx-auto w-9 cursor-pointer"
      />
      {!!data?.length && (
        <BaseModal opened={isModalOpened} onClose={() => setIsModalOpened(false)} className="bottom-4 right-0">
          <div className="flex w-48 flex-row flex-wrap items-center justify-center space-x-4">
            {data.map((link) =>
              copy ? (
                <button
                  onClick={async () => {
                    await copyToClipboard(link.href);
                    toast.success(`You successfully copied ${link.name.toUpperCase()} to clipboard`);
                  }}
                  className="text-lg uppercase underline hover:text-highlight hover:no-underline"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  className="text-lg uppercase underline hover:text-highlight hover:no-underline"
                >
                  {link.name}
                </Link>
              ),
            )}
          </div>
        </BaseModal>
      )}
    </>
  );
};

export default CheckMark;
