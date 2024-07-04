'use client';

import { FC, useState } from 'react';

import Button from '@/components/common/button';
import InfoButton from '@/components/common/info-button';

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
        <Button onClick={() => setIsOpened(!isOpened)} isActive={isOpened}>
          <div className="flex flex-row items-center justify-center space-x-2 text-sm">
            <InfoButton />
            <div>Filters:</div>
            <div className="h-1.5 w-2 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default ValidatorListFilters;
