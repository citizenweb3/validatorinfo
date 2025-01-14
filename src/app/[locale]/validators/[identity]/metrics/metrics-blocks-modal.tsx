'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  formulaUrl: string;
  title: string;
}

const MetricBlocksModal: FC<OwnProps> = ({ formulaUrl, title }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  return (
    <div>
      <div>
        <PlusButton size="sm" isOpened={isModalOpened} onClick={() => setIsModalOpened(true)} />
      </div>
      <BaseModal
        opened={isModalOpened}
        hideClose
        onClose={() => setIsModalOpened(false)}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-4 transform"
      >
        <div className="flex w-40 flex-row flex-wrap">
          <div
            className={`absolute right-0 top-0 z-50 h-8 w-8 bg-close bg-contain hover:bg-close_h active:bg-close_a`}
            onClick={() => setIsModalOpened(false)}
          />
          <h2 className="my-2 text-sm">{title}...</h2>
          <Image src={formulaUrl} alt="formula" width={170} height={28} className="h-50 w-50 mx-auto mt-6" />
        </div>
      </BaseModal>
    </div>
  );
};

export default MetricBlocksModal;
