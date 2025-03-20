import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import SubTitle from '@/components/common/sub-title';
import { Chain } from '@prisma/client';

interface OwnProps {
  chain: Chain | null;
}

const NetworkAprTvs: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');
  const fontColors = {
    APR: '#4FB848',
    APY: '#E5C46B',
    TVS: '#2077E0',
  };

  return (
    <div className="mt-16">
      <SubTitle text={t('Network APR and TVS')} />
      <div className="flex flex-row mt-12">
        <div className="w-1/5">
          <div className="mt-2 flex w-full flex-wrap">
            <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">
              APR
            </div>
            <div
              style={{ color: fontColors['APR'] }}
              className="flex w-1/2 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
            >
              {((chain?.apr ?? 0.15) * 100).toFixed(2)}%
            </div>
          </div>
          {networkProfileExample.aprAndTvs.map((item) => (
            <div key={item.title} className="mt-2 flex w-full flex-wrap">
              <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">
                {item.title}
              </div>
              <div
                style={{ color: fontColors[item.title as 'APR'] }}
                className="flex w-1/2 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
              >
                {item.data}
              </div>
            </div>
          ))}
        </div>
        <div className="w-4/5">
          <Image
            src={'/img/charts/network-apr-tvs-chart.svg'}
            width={1100}
            height={250}
            alt="apr tvs chart"
            className="ml-16"
          />
        </div>
      </div>
    </div>
  );
};

export default NetworkAprTvs;
