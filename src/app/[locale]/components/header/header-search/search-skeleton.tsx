import { FC } from 'react';

interface OwnProps {}

const SearchSkeleton: FC<OwnProps> = ({}) => {
  return Array.from({ length: 3 }, (_, i) => (
    <div>
      <div className="h-4 w-40 animate-pulse rounded-full bg-bgSt" />
      <div className="">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center px-4 py-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-bgSt"></div>
            <div
              className="ml-4 h-3 animate-pulse rounded-full bg-bgSt"
              style={{ width: Math.random() * (20 - 6) + 6 + 'rem' }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  ));
};

export default SearchSkeleton;
