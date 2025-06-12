import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import SubTitle from '@/components/common/sub-title';
import nodeService from '@/services/node-service';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
}

const NetworkOverview: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');

  const nodes = await nodeService.getNodesByChainId(chain?.id ?? 1);
  const activeNodes = nodes?.filter(node => node.jailed === false);

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case '% of comm pool to total supply':
        return `${data}%`;
      case 'comm pool value in usd':
        return `$${data.toLocaleString('en-En')}`;
      default:
        return data;
    }
  };

  return (
    <div className="mt-5">
      <SubTitle text={t('Network Overview')} />
      <div className="mt-2 flex w-full hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('active validators')}
        </div>
        <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {activeNodes && activeNodes?.length > 0 ? activeNodes?.length : '0'}
        </div>
      </div>
      <div className="mt-2 flex w-full hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('unbonding time')}
        </div>
        <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {chain?.params?.unbondingTime ?? 600}s
        </div>
      </div>
      {chain?.params?.communityTax !== null && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('community tax')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain?.params?.communityTax}%
          </div>
        </div>
      )}
      {chain?.params?.proposalCreationCost !== null && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('proposal creation cost')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain?.params?.proposalCreationCost} {chain?.params?.denom}
          </div>
        </div>
      )}
      {chain?.params?.votingPeriod !== null && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('voting period')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain?.params?.votingPeriod}
          </div>
        </div>)}
      {networkProfileExample.networkOverview.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t(`${item.title as 'active validators'}`)}
          </div>
          <div
            className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
      {chain?.params?.jailedDuration && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('slashing')}
          </div>
          <div
            className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain.params.jailedDuration}
          </div>
        </div>
      )}
      <div className="mt-2 flex w-full hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
          {t('average block time')}
        </div>
        <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {chain?.avgTxInterval.toFixed(2)}s
        </div>
      </div>
    </div>
  );
};

export default NetworkOverview;
