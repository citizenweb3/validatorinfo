import { FC } from 'react';

interface OwnProps {}

const skeletonWidths = ['w-24', 'w-40', 'w-56', 'w-32', 'w-48'];

const SearchSkeleton: FC<OwnProps> = ({}) => {
  return Array.from({ length: 3 }, (_, i) => (
    <div key={i}>
      <div className="h-4 w-40 animate-pulse rounded-full bg-bgSt" />
      <div className="">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center px-4 py-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-bgSt"></div>
            <div className={`${skeletonWidths[i]} ml-4 h-3 animate-pulse rounded-full bg-bgSt`}></div>
          </div>
        ))}
      </div>
    </div>
  ));
};

export default SearchSkeleton;
