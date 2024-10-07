import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';
import Tooltip from '@/components/common/tooltip';
import { Chain } from '@/types';

interface OwnProps {
  chains: (Chain | string)[];
}

const ValidatorListItemChains: FC<OwnProps> = ({ chains }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  return (
    <div className="flex items-center justify-center space-x-0.5">
      {chains.length > 4 && <div className="mr-2 font-handjet text-sm">{chains.length}:</div>}
      {chains.slice(0, 4).map((chain) =>
        typeof chain === 'string' ? (
          chain
        ) : (
          <Link key={chain.chainId} href={`/networks/${chain.chainId}`}>
            <Tooltip direction="top" tooltip={chain.prettyName}>
              <Image
                src={chain.logoUrl}
                alt={chain.prettyName}
                width={24}
                height={24}
                className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0 "
              />
            </Tooltip>
          </Link>
        ),
      )}
      {chains.length > 4 && (
        <>
          <PlusButton isOpened={isModalOpened} onClick={() => setIsModalOpened(true)} />
          <BaseModal
            opened={isModalOpened}
            hideClose
            onClose={() => setIsModalOpened(false)}
            className="bottom-4 right-0"
          >
            <div className="flex w-40 flex-row flex-wrap items-center justify-center">
              {chains.map((chain) =>
                typeof chain === 'string' ? (
                  chain
                ) : (
                  <Link key={chain.chainId} href={`/networks/${chain.chainId}`} className="h-7 w-7">
                    {/*<Tooltip direction="top" tooltip={chain.prettyName}>*/}
                    <Image
                      src={chain.logoUrl}
                      alt={chain.prettyName}
                      width={24}
                      height={24}
                      className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0"
                    />
                    {/*</Tooltip>*/}
                  </Link>
                ),
              )}
            </div>
          </BaseModal>
        </>
      )}
    </div>
  );
};

export default ValidatorListItemChains;
