import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import Image from 'next/image';

interface OwnProps {
  denom?: string;
  price?: number;
}

const DistributionGiniParameters: FC<OwnProps> = async ({ denom, price }) => {
  const t = await getTranslations('NetworkTokenomics');

  return (
    <div>
      <div className="grid grid-cols-2">
        <div>
          <SubTitle text={t('Distribution')} />
          <div className="flex flex-row">
            <Image
              src={'/img/charts/distribution-circle-chart.svg'}
              width={400}
              height={250}
              alt="distribution"
              className=""
            />
          </div>
        </div>
        <div>
          <SubTitle text={t('Distribution')} />
          <div className="flex flex-row">
            <Image
              src={'/img/charts/distribution-circle-chart.svg'}
              width={300}
              height={150}
              alt="distribution"
              className=""
            />
          </div>
        </div>
      </div>
    </div>

  );
};

export default DistributionGiniParameters;
