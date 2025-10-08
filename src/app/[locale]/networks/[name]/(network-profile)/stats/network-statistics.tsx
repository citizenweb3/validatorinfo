import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import formatCash from '@/utils/format-cash';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const NetworkStatistics: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkStatistics');
  const totalStaked = Number(chain?.tokenomics?.bondedTokens) / 10 ** Number(chain?.params?.coinDecimals);
  const communityPool = Number(chain?.tokenomics?.communityPool) / 10 ** Number(chain?.params?.coinDecimals);

  return (
    <div className="grid grid-cols-2 gap-x-10">
      <div className="mt-2 flex w-full hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg ">
          {t('total staked')}
        </div>
        <div
          className="flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight">
          <Tooltip tooltip={totalStaked.toLocaleString()}>
            {`${formatCash(totalStaked)} ${chain?.params?.denom}`}
          </Tooltip>
        </div>
      </div>
      <div className="mt-2 flex w-full hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg ">
          {t('% staked')}
        </div>
        <div
          className="flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight">
          {(Number(chain?.tokenomics?.tvs) * 100).toFixed(2)}%
        </div>
      </div>
      <div className="mt-2 flex w-full hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg ">
          {t('community pool total')}
        </div>
        <div
          className="flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight">
          <Tooltip tooltip={communityPool.toLocaleString()}>
            {`${formatCash(communityPool)} ${chain?.params?.denom}`}
          </Tooltip>
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
