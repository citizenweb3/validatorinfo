import { Chain } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  chains: (Chain & { valoper: string })[];
}

// One entry per NODE arrives here; collapse to unique networks so a validator running
// several nodes on the same chain shows that chain once, linked to the network — not to
// each duplicated node.
const dedupeByChain = (raw: (Chain & { valoper: string })[]): Chain[] => {
  const seen = new Set<number>();
  const unique: Chain[] = [];
  for (const chain of raw) {
    if (chain == null || typeof chain.id !== 'number' || !chain.name) continue;
    if (seen.has(chain.id)) continue;
    seen.add(chain.id);
    unique.push(chain);
  }
  return unique;
};

const ValidatorListItemChains: FC<OwnProps> = ({ chains: raw }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  const chains = dedupeByChain(raw);

  return (
    <div className="flex items-center justify-center space-x-0.5">
      {chains.length > 4 && <div className="mr-2 font-handjet text-sm">{chains.length}:</div>}
      {chains.slice(0, 4).map((chain) => (
        <Link key={chain.id} href={`/networks/${chain.name}/overview`}>
          <Tooltip direction="top" tooltip={chain.prettyName} className="text-sm font-bold">
            <Image
              src={chain.logoUrl}
              alt={chain.prettyName}
              width={24}
              height={24}
              className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0 "
            />
          </Tooltip>
        </Link>
      ))}
      {chains.length > 4 && (
        <>
          <div className="-mt-2.5">
            <PlusButton
              size="md"
              isOpened={isModalOpened}
              onClick={() => {
                setIsModalOpened(!isModalOpened);
              }}
            />
          </div>
          {isModalOpened && (
            <BaseModal
              opened={true}
              onClose={() => setIsModalOpened(false)}
              isRelative
              className="absolute -top-6 right-0 z-40"
            >
              <div className="flex max-h-96 w-40 flex-row flex-wrap items-center justify-center">
                {chains.map((chain) => (
                  <Link key={chain.id} href={`/networks/${chain.name}/overview`} className="h-7 w-7">
                    <Tooltip direction="top" tooltip={chain.prettyName} className="text-sm font-bold">
                      <Image
                        src={chain.logoUrl}
                        alt={chain.prettyName}
                        width={24}
                        height={24}
                        className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0"
                      />
                    </Tooltip>
                  </Link>
                ))}
              </div>
            </BaseModal>
          )}
        </>
      )}
    </div>
  );
};

export default ValidatorListItemChains;
