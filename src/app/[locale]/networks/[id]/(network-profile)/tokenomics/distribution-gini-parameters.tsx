import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import nodeService from '@/services/node-service';
import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import TokenDistributionSVG from '@/components/customSVG/tokenDistribution';
import GiniCoefficientSVG from '@/components/customSVG/giniCoefficient';
import chainService from '@/services/chain-service';
import { Chain } from '@prisma/client';
import formatCash from '@/utils/format-cash';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  chain: Chain | null;
}

const DistributionGiniParameters: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkTokenomics');

  const nodes = await nodeService.getNodesByChainId(chain?.id ?? 1);
  const totalSupply = chain ? (+chain.totalSupply / 10 ** chain.coinDecimals) : 0;
  const tokenPrice = chain ? (await chainService.getTokenPriceByChainId(chain.id)) : null;
  const fdv = tokenPrice?.value ? totalSupply * tokenPrice.value : 90;

  return (
    <div className="mt-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12">
        <div className="flex flex-col">
          <SubTitle text={t('Distribution')} />
          <div className="flex mt-5 md:ml-20 justify-center md:justify-start">
            <TokenDistributionSVG Community={40} Team={10} Vc={10} Inflation={40} />
          </div>
        </div>
        <div>
          <SubTitle text={t('Gini Coefficient')} />
          <div className="flex flex-row mt-9 md:ml-20 justify-center md:justify-start">
            <GiniCoefficientSVG value={69} />
            <div className="flex flex-col justify-center ml-4">
              <div className="font-sfpro text-base">{t('number of validators')}</div>
              <div className="font-handjet text-lg text-highlight">{nodes?.length ?? '234'}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24 flex w-full flex-wrap justify-center gap-6">
        <MetricsCardItem
          title={t('fdv')}
          data={
            <Tooltip tooltip={`$${fdv.toLocaleString()}`}>
              <div className="text-center">${formatCash(fdv)}</div>
            </Tooltip>
          }
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t('% of tokens staked')}
          data={`${(Number(chain?.tvs) * 100).toFixed(2)}%`}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        {networkProfileExample.distributionParameters.map((item) => (
          <MetricsCardItem
            key={item.title}
            title={t(item.title as 'community pool tvl')}
            data={item.data}
            className="pb-8 pt-2.5"
            dataClassName="mt-6"
          />
        ))}
      </div>
    </div>
  );
};

export default DistributionGiniParameters;