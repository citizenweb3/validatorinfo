'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton, { Size } from '@/components/common/plus-button';
import { validatorNodesWithChainData } from '@/services/validator-service';
import Link from 'next/link';
import icons from '@/components/icons';

interface OwnProps {
  item?: string;
  title?: string;
  list?: validatorNodesWithChainData[];
  plusButtonSize?: Size;
}

const MetricsCardsModal: FC<OwnProps> = ({ item, title, list, plusButtonSize = 'sm' }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  return (
    <div>
      <div>
        <PlusButton size={plusButtonSize} isOpened={isModalOpened} onClick={() => setIsModalOpened(true)} />
      </div>
      <BaseModal
        opened={isModalOpened}
        hideClose
        onClose={() => setIsModalOpened(false)}
        isRelative
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-4 transform"
      >
        <div className="flex w-40 flex-row flex-wrap">
          <div
            className={`absolute right-0 top-0 z-50 h-8 w-8 bg-close bg-contain hover:bg-close_h active:bg-close_a`}
            onClick={() => setIsModalOpened(false)}
          />
          {item && title && (
            <div>
              <h2 className="my-2 text-sm">{title}...</h2>
              <Image src={item} alt="modal" width={170} height={28} className="h-50 w-50 mx-auto mt-6" />
            </div>
          )}
          {list && (
            <div className="mt-6 flex w-40 flex-row flex-wrap items-center justify-center">
              {list.map((chain) => (
                <Link key={chain.operatorAddress} href={`/networks/${chain.chainId}/passport`} className="h-7 w-7">
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
          )}
        </div>
      </BaseModal>
    </div>
  );
};

export default MetricsCardsModal;
