import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import nodeService from '@/services/node-service';

import PowerBarChart from './validatorVotingPercentage';

interface OwnProps {
  chainId: number | null;
}

const OperatorDistribution: FC<OwnProps> = async ({ chainId }) => {
  const t = await getTranslations('NetworkStatistics');
  const fontColors = {
    active: '#4FB848',
    jailed: '#AD1818',
    inactive: '#E5C46B',
  };

  const data = generateData();
  const nodes = chainId ? await nodeService.getNodesByChainId(chainId) : null;
  const activeNodes = nodes?.filter((node) => node.jailed === false);
  const jailedNodes = nodes?.filter((node) => node.jailed === true);

  return (
    <div className="mt-12">
      <SubTitle text={t('Operator Distributions')} />
      <div className="mt-12 flex flex-row">
        <div className="w-1/5">
          <div className="mt-2 flex w-full flex-wrap border-b border-bgSt">
            <div className="w-1/2 items-center border-r border-bgSt py-5 pl-9 font-sfpro text-lg">{t('active')}</div>
            <div
              style={{ color: fontColors['active'] }}
              className="flex w-1/2 items-center justify-between py-5 pl-7 font-handjet text-lg"
            >
              {activeNodes?.length ?? '232'}
            </div>
          </div>
          <div className="mt-2 flex w-full flex-wrap border-b border-bgSt">
            <div className="w-1/2 items-center border-r border-bgSt py-5 pl-9 font-sfpro text-lg">{t('jailed')}</div>
            <div
              style={{ color: fontColors['jailed'] }}
              className="flex w-1/2 items-center justify-between py-5 pl-7 font-handjet text-lg"
            >
              {jailedNodes?.length ?? '423'}
            </div>
          </div>
        </div>
        <div className="w-4/5">
          <Image
            src={'/img/charts/operator-distribution-coef.svg'}
            width={960}
            height={190}
            alt="coefficients"
            className="ml-24 mt-1.5"
          />
        </div>
      </div>
      <div className="ml-16 mt-20 flex">
        <PowerBarChart data={data} />
      </div>
    </div>
  );
};

export default OperatorDistribution;

const generateData = () => {
  const names = Array.from({ length: 50 }, (_, i) => `Validator ${i + 1}`);
  const randomPercents = Array(50)
    .fill(0)
    .map(() => Math.random());
  const total = randomPercents.reduce((sum, val) => sum + val, 0);
  const normalized = randomPercents.map((val) => (val / total) * 100);

  return names.map((name, i) => ({
    name,
    percent: normalized[i],
  }));
};
