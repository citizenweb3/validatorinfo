import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import PlusButton from '@/components/common/plus-button';
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
    chain?.tokenomics?.activeSetMinAmount && price && chain?.params?.coinDecimals != null
      ? (Number(chain.tokenomics.activeSetMinAmount) / 10 ** Number(chain?.params?.coinDecimals)) * Number(price.value)
      : 0;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center justify-between rounded bg-card pl-10 pr-2 py-2 my-1 hover:shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black] hover:text-highlight">
        <span className="font-sfpro text-base">{t('validator cost')}</span>
        <div className="flex items-center">
          <span className="font-handjet text-lg mr-8">
            <Tooltip tooltip={validatorCost?.toLocaleString()}>{`$${formatCash(validatorCost)}`}</Tooltip>
          </span>
          <PlusButton size="xs" isOpened={false} />
        </div>
      </div>
      {networkProfileExample.headerMetrics.map((item) => (
        <div
          key={item.title}
          className="flex items-center justify-between rounded bg-card pl-10 pr-2 py-2 my-1 hover:shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black] hover:text-highlight"
        >
          <span className="font-sfpro text-base">{t(item.title as 'tvl')}</span>
          <div className="flex items-center">
            <span className="font-handjet text-lg mr-8">{item.data}</span>
            <PlusButton size="xs" isOpened={false} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsHeader;
