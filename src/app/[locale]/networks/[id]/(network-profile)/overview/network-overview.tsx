import { Chain } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import SubTitle from '@/components/common/sub-title';
import nodeService from '@/services/node-service';

interface OwnProps {
  chain: Chain | null;
}

const NetworkOverview: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');

  const nodes = await nodeService.getNodesByChainId(chain?.id ?? 1);
  const activeNodes = nodes?.filter(node => node.jailed === false);

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'unbonding time':
      case 'voting period':
      case 'community tax':
      case '% of comm pool to total supply':
        return `${data}%`;
      case 'proposal creation cost':
        return `${data} ${chain?.denom ?? 'ATOM'}`;
      case 'comm pool value in usd':
        return `$${data.toLocaleString('en-En')}`;
      case 'active validators':
        return `${activeNodes?.length ?? data}`;
      default:
        return data;
    }
  };

  return (
    <div className="mt-5">
      <SubTitle text={t('Network Overview')} />
      {networkProfileExample.networkOverview.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
            {t(`${item.title as 'active validators'}`)}
          </div>
          <div
            className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
      <div className="mt-2 flex w-full hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
          {t('slashing')}
        </div>
        <div
          className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {chain?.jailedDuration}
        </div>
      </div>
      <div className="mt-2 flex w-full hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
          {t('average block time')}
        </div>
        <div
          className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {chain?.avgTxInterval.toFixed(2)}s
        </div>
      </div>
    </div>
  );
};

export default NetworkOverview;
