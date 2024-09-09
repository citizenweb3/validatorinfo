import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';
import Tooltip from '@/components/common/tooltip';
import { ValidatorChain } from '@/types';

interface OwnProps {
  chains: ValidatorChain[];
}

const ValidatorListItemChains: FC<OwnProps> = ({ chains }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  return (
    <div className="flex items-center justify-center space-x-0.5">
      {chains.length > 4 && <div className="mr-2 font-handjet text-sm">{chains.length}:</div>}
      {chains.slice(0, 4).map((chain) => (
        <Link key={chain.id} href={`/networks/${chain.id}`}>
          <Tooltip direction="top" tooltip={chain.name}>
            <Image
              src={chain.icon}
              alt={chain.name}
              width={24}
              height={24}
              className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0 "
            />
          </Tooltip>
        </Link>
      ))}
      {chains.length > 4 && (
        <>
          <PlusButton isOpened={isModalOpened} onClick={() => setIsModalOpened(true)} />
          <BaseModal
            opened={isModalOpened}
            hideClose
            onClose={() => setIsModalOpened(false)}
            className="bottom-4 right-0"
          >
            <div className="flex w-40 min-w-40 max-w-40 flex-row flex-wrap items-center justify-center">
              {chains.map((chain) => (
                <Link
                  key={chain.id}
                  href={`/networks/${chain.id}`}
                  className="flex h-7 w-7 items-center justify-center"
                >
                  <Tooltip direction="top" tooltip={chain.name}>
                    <Image
                      src={chain.icon}
                      alt={chain.name}
                      width={24}
                      height={24}
                      className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0"
                    />
                  </Tooltip>
                </Link>
              ))}
            </div>
          </BaseModal>
        </>
      )}
    </div>
  );
};

export default ValidatorListItemChains;
