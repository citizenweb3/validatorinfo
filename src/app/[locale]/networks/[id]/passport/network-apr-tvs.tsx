import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';
import SubTitle from '@/components/common/sub-title';

interface OwnProps {}

const NetworkAprTvs: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkPassport');
  const fontColors = {
    APR: '#4FB848',
    APY: '#E5C46B',
    TVL: '#2077E0',
  };

  return (
    <>
      <SubTitle text={t('Network APR and TVS')} />
      <div className="flex flex-row mt-8">
        <div className="w-1/5">
          {networkProfileExample.aprAndTvs.map((item) => (
            <div key={item.title} className="mt-2 flex w-full flex-wrap">
              <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">
                {item.title}
              </div>
              <div
                style={{ color: fontColors[item.title as 'APR'] }}
                className="flex w-1/2 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-base"
              >
                {item.data}
              </div>
            </div>
          ))}
        </div>
        <div className="w-4/5">
          <Image
            src={'/img/charts/network-apr-tvs-chart.svg'}
            width={1342}
            height={317}
            alt="apr tvs chart"
            className="w-full px-10"
          />
        </div>
      </div>
    </>
  );
};

export default NetworkAprTvs;
