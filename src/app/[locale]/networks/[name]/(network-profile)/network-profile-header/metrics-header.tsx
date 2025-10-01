import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import ToolTip from '@/components/common/tooltip';
import Tooltip from '@/components/common/tooltip';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const MetricsHeader: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkProfileHeader');
  const price = chain ? await chainService.getTokenPriceByChainId(chain?.id) : undefined;
  const validatorCost =
    chain?.tokenomics?.activeSetMinAmount && price && chain?.params?.coinDecimals
      ? (Number(chain.tokenomics.activeSetMinAmount) / 10 ** Number(chain?.params?.coinDecimals)) * Number(price.value)
      : 0;

  return (
    <div className="mt-16 flex w-full justify-center gap-5">
      <ToolTip tooltip={t('validator cost tooltip')} direction={'top'}>
        <MetricsCardItem
          title={t('validator cost')}
          data={<Tooltip tooltip={validatorCost?.toLocaleString()}>{`$${formatCash(validatorCost)}`}</Tooltip>}
          titleClassName="my-1"
          className="xs:w-[70px]
                     sm:w-[80px]
                     md:w-[120px]
                     lg:w-[140px]
                     xl:w-[150px]
                     2xl:w-[190px]"
          isModal
        />
      </ToolTip>
      {networkProfileExample.headerMetrics.map((item) => (
        <ToolTip key={item.title} tooltip={t('tvl tooltip')} direction={'top'}>
          <MetricsCardItem
            key={item.title}
            title={t(item.title as 'tvl')}
            data={item.data}
            titleClassName="my-1"
            className="xs:w-[70px]
                       sm:w-[80px]
                       md:w-[120px]
                       lg:w-[140px]
                       xl:w-[150px]
                       2xl:w-[190px]"
            isModal
          />
        </ToolTip>
      ))}
    </div>
  );
};

export default MetricsHeader;
