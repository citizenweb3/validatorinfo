import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';
import SubTitle from '@/components/common/sub-title';

interface OwnProps {}

const OperatorDistribution: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkStatistics');
  const fontColors = {
    active: '#4FB848',
    jailed: '#AD1818',
    inactive: '#E5C46B',
  };

  return (
    <div className="mt-10">
      <SubTitle text={t('Operator Distributions')} />
      <div className="mt-8 flex flex-row">
        <div className="w-1/5">
          {networkProfileExample.operatorDistribution.map((item) => (
            <div key={item.title} className="mt-2 flex w-full flex-wrap">
              <div className="w-1/2 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">
                {t(`${item.title as 'active'}`)}
              </div>
              <div
                style={{ color: fontColors[item.title as 'active'] }}
                className="flex w-1/2 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-base"
              >
                {item.data}
              </div>
            </div>
          ))}
        </div>
        <div className="w-4/5">
          <Image
            src={'/img/charts/operator-distribution-coef.svg'}
            width={1100}
            height={200}
            alt="coefficients"
            className="w-full px-28"
          />
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <Image src={'/img/charts/operator-distribution-vp.svg'} width={1100} height={200} alt="vp" className="w-full px-28" />
      </div>
    </div>
  );
};

export default OperatorDistribution;
