import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import UnderDevelopment from '@/components/common/under-development';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import aztecDbService from '@/services/aztec-db-service';
import validatorService from '@/services/validator-service';

const NetworkTvsAztecChart = dynamic(() => import('./network-tvs-aztec-chart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center"
         style={{ height: '400px', backgroundColor: '#181818', borderRadius: '4px' }}>
      <div className="font-sfpro text-lg text-white opacity-70">Loading chart...</div>
    </div>
  ),
});

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const NetworkAprTvs: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');

  const isAztec = chain?.name === 'aztec' || chain?.name === 'aztec-testnet';

  const chartData = isAztec && chain
    ? await aztecDbService.getChartData(chain.name)
    : [];

  const validatorsCount = chain
    ? isAztec
      ? await aztecDbService.getCurrentValidatorsCount(chain.name)
      : (await validatorService.getValidatorsByChainId(chain.id)).length
    : 0;

  return (
    <div className="mt-16">
      <SubTitle text={t('Network APR and TVS')} />
      <div className="mt-12 flex flex-row items-center gap-6">
        <div className="w-1/5 rounded" style={{ backgroundColor: '#181818' }}>
          <div className="mt-2 flex w-full flex-wrap">
            <div className="w-2/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">APR</div>
            <div
              style={{ color: '#4FB848' }}
              className="flex w-1/3 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
            >
              {((chain?.tokenomics?.apr ?? 0.15) * 100).toFixed(2)}%
            </div>
          </div>
          <div className="mt-2 flex w-full flex-wrap">
            <div className="w-2/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">TVS</div>
            <div
              style={{ color: '#E5C46B' }}
              className="flex w-1/3 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
            >
              {((chain?.tokenomics?.tvs ?? 0.5) * 100).toFixed(2)}%
            </div>
          </div>
          <div className="mt-2 flex w-full flex-wrap">
            <div className="w-2/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">
              {t('Validator Count')}
            </div>
            <div
              style={{ color: '#2077E0' }}
              className="flex w-1/3 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
            >
              {validatorsCount}
            </div>
          </div>
        </div>
        <div className="w-4/5">
          {isAztec ? (
            <NetworkTvsAztecChart initialData={chartData} />
          ) : (
            <UnderDevelopment
              title="Data is currently unavailable. Live metrics will return once maintenance is complete." size="lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkAprTvs;
