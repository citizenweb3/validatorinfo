import { FC } from 'react';

const OperatorDistributionSkeleton: FC = () => {
  return (
    <div className="mt-12 animate-pulse">
      <div className="h-7 w-64 rounded bg-bgSt" />

      <div className="mt-12 flex flex-row">
        <div className="w-1/5">
          <div className="mt-2 flex w-full flex-wrap border-b border-bgSt">
            <div className="w-1/2 items-center border-r border-bgSt py-5 pl-9">
              <div className="h-5 w-16 rounded bg-bgSt" />
            </div>
            <div className="flex w-1/2 items-center py-5 pl-7">
              <div className="h-5 w-12 rounded bg-bgSt" />
            </div>
          </div>

          <div className="mt-2 flex w-full flex-wrap border-b border-bgSt">
            <div className="w-1/2 items-center border-r border-bgSt py-5 pl-9">
              <div className="h-5 w-16 rounded bg-bgSt" />
            </div>
            <div className="flex w-1/2 items-center py-5 pl-7">
              <div className="h-5 w-12 rounded bg-bgSt" />
            </div>
          </div>
        </div>

        <div className="w-4/5">
          <div className="ml-24 mt-1.5 h-[190px] w-[960px] rounded bg-bgSt" />
        </div>
      </div>

      <div className="ml-16 mt-20 flex">
        <div className="h-[200px] w-full rounded bg-bgSt" />
      </div>
    </div>
  );
};

export default OperatorDistributionSkeleton;
