import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import { Chain } from '@prisma/client';
import formatCash from '@/utils/format-cash';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  chain: Chain | null;
}

const NetworkStatistics: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkStatistics');
  const totalStaked = Number(chain?.bondedTokens) / 10 ** Number(chain?.coinDecimals);

  return (
    <div className="grid grid-cols-2 gap-x-10">
      <div className="mt-2 flex w-full hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg ">
          {t('total staked')}
        </div>
        <div
          className="flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight">
          <Tooltip tooltip={totalStaked.toLocaleString()}>
            {`${formatCash(totalStaked)} ${chain?.denom}`}
          </Tooltip>
        </div>
      </div>
      <div className="mt-2 flex w-full hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg ">
          {t('% staked')}
        </div>
        <div
          className="flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight">
          {(Number(chain?.tvs) * 100).toFixed(2)}%
        </div>
      </div>
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
