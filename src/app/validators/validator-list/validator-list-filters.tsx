import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {}

const filterItems = [
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'polkadot', title: 'Polkadot' },
  { value: 'ethereum', title: 'Ethereum' },
  { value: 'near', title: 'Near' },
  { value: 'avalanche', title: 'Avalanche' },
];

const ValidatorListFilters: FC<OwnProps> = ({}) => {
  const searchParams = useSearchParams();
  const chains = searchParams.getAll('chains') ?? [];

  return (
    <div className="flex space-x-2">
      <div className="flex flex-row items-center space-x-1  border-b border-bgSt px-4">
        <Image src={icons.QuestionIcon} alt="control" className="-mt-1 w-3" />
        <div className="text-base">Filters:</div>
      </div>
      {filterItems.map((item) => (
        <Link
          href={{
            pathname: '/validators',
            query: {
              chains:
                chains.indexOf(item.value) === -1 ? [...chains, item.value] : chains.filter((c) => c !== item.value),
            },
          }}
          key={item.value}
          className={`${chains.indexOf(item.value) !== -1 ? 'border border-highlight text-highlight' : 'border-b border-transparent border-b-bgSt'} px-4 text-base`}
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
};

export default ValidatorListFilters;
