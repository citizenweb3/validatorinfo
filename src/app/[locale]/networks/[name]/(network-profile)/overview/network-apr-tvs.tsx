import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

import NetworkAprTvsChartClient from './network-apr-tvsChart';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const NetworkAprTvs: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');

  return (
    <div className="mt-16">
      <SubTitle text={t('Network APR and TVS')} />
      <div className="mt-12 flex flex-row">
        <div className="w-1/5">
          <div className="mt-2 flex w-full flex-wrap">
            <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">APR</div>
            <div
              style={{ color: '#4FB848' }}
              className="flex w-1/2 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
            >
              {((chain?.tokenomics?.apr ?? 0.15) * 100).toFixed(2)}%
            </div>
          </div>
          <div className="mt-2 flex w-full flex-wrap">
            <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">APY</div>
            <div
              style={{ color: '#E5C46B' }}
              className="flex w-1/2 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
            >
              {((chain?.tokenomics?.apr ?? 0.15) * 100).toFixed(2)}%
            </div>
          </div>
          <div className="mt-2 flex w-full flex-wrap">
            <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">TVS</div>
            <div
              style={{ color: '#2077E0' }}
              className="flex w-1/2 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
            >
              {((chain?.tokenomics?.tvs ?? 0.5) * 100).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="w-4/5">
          <NetworkAprTvsChartClient />
        </div>
      </div>
    </div>
  );
};

export default NetworkAprTvs;
