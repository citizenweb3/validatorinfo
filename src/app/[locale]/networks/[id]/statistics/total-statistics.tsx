import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';

interface OwnProps {
}

const TotalStatistics: FC<OwnProps> = async ({}) => {
  const t = await getTranslations('NetworkStatistics');

  return (
    <>
      <div className="mt-7 grid grid-cols-2 gap-x-10">
        {networkProfileExample.totalStatistics.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base ">
              {t(`${item.title as 'community pool total'}`)}
            </div>
            <div
              className="flex w-1/2 cursor-pointer items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-base hover:text-highlight">
              {item.data}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TotalStatistics;
