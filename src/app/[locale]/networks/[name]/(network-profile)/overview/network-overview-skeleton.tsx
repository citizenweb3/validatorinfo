import { FC } from 'react';

const NetworkOverviewSkeleton: FC = () => {
  return (
    <div className="mt-2 flex w-full hover:bg-bgHover">
      <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
        <div className="bg-gray-700 h-5 w-32 animate-pulse rounded" />
      </div>
      <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg">
        <div className="bg-gray-700 h-5 w-16 animate-pulse rounded" />
      </div>
    </div>
  );
};

export default NetworkOverviewSkeleton;
