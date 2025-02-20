'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';
import icons from '@/components/icons';
import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  list: validatorNodesWithChainData[];
}

const MetricsAssetsModal: FC<OwnProps> = ({ list }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  return (
    <div>
      <div>
        <PlusButton size="sm" isOpened={isModalOpened} onClick={() => setIsModalOpened(true)} />
      </div>
      <BaseModal
        opened={isModalOpened}
        hideClose
        isRelative
        onClose={() => setIsModalOpened(false)}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-4 transform"
      >
        <div className="mb-6 flex w-40 flex-row flex-wrap">
          <div
            className={`absolute right-0 top-0 z-50 h-8 w-8 bg-close bg-contain hover:bg-close_h active:bg-close_a`}
            onClick={() => setIsModalOpened(false)}
          />
        </div>
        <div className="flex w-40 flex-row flex-wrap items-center justify-center">
          {list.map((chain) => (
            <Link key={chain.operatorAddress} href={`/networks/${chain.chainId}`} className="h-7 w-7">
              <Image
                src={chain.logoUrl ?? icons.AvatarIcon}
                alt={chain.prettyName || 'chain'}
                width={24}
                height={24}
                className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0"
              />
            </Link>
          ))}
        </div>
      </BaseModal>
    </div>
  );
};

export default MetricsAssetsModal;
