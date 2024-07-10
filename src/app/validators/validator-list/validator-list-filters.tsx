'use client';

import { FC, useState } from 'react';

import Button from '@/components/common/button';
import InfoButton from '@/components/common/info-button';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  chains: string[];
}

const filterItems = [
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'polkadot', title: 'Polkadot' },
  { value: 'ethereum', title: 'Ethereum' },
  { value: 'near', title: 'Near' },
  { value: 'avalanche', title: 'Avalanche' },
];

const ValidatorListFilters: FC<OwnProps> = ({ chains = [] }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  return (
    <div className="flex h-9 justify-end space-x-2">
      {isOpened &&
        filterItems.map((item) => (
          <Button
            component="link"
            href={{
              pathname: '/validators',
              query: {
                chains:
                  chains.indexOf(item.value) === -1 ? [...chains, item.value] : chains.filter((c) => c !== item.value),
              },
            }}
            key={item.value}
            isActive={chains.indexOf(item.value) !== -1}
            className="text-sm"
          >
            {item.title}
          </Button>
        ))}
      <div className="flex flex-row items-center">
        <Button onClick={() => setIsOpened(!isOpened)} isActive={isOpened} className="hover:!bg-background">
          <div className="absolute inset-0 z-10 bg-background" />
          <div className="z-20 -my-1 flex flex-row items-center justify-center text-sm group-hover/button:bg-background">
            <InfoButton />
            <div>Filters:</div>
            <PlusButton size="sm" isOpened={isOpened} />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default ValidatorListFilters;
