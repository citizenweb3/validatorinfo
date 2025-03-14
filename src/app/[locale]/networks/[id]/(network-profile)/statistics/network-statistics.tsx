import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';

interface OwnProps {
}

const NetworkStatistics: FC<OwnProps> = async ({}) => {
  const t = await getTranslations('NetworkStatistics');

  return (
    <div className="mt-4 grid grid-cols-2 gap-x-10">
      {networkProfileExample.totalStatistics.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover border-b border-bgSt">
          <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg ">
            {t(`${item.title as 'community pool total'}`)}
          </div>
          <div
            className="flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight">
            {item.data}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NetworkStatistics;
