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

interface MetricRow {
  key: string;
  title: string;
  data: string;
  tooltip?: string;
  blur?: boolean;
}

const MetricsHeader: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkProfileHeader');

  const isPow = chain?.consensusType === 'pow';

  const rows: MetricRow[] = [];

  const price = chain ? await chainService.getTokenPriceByChainId(chain.id) : undefined;
  // PoW chains (Monero) have no validator set / staking — validatorCost stays 0 and the row blurs,
  // same as the placeholder MAU/TVL/Revenue rows below. They render but stay blurred + disabled.
  const validatorCost =
    chain?.tokenomics?.activeSetMinAmount && price && chain?.params?.coinDecimals != null
      ? (Number(chain.tokenomics.activeSetMinAmount) / 10 ** Number(chain.params.coinDecimals)) * Number(price.value)
      : 0;

  rows.push({
    key: 'validator cost',
    title: t('validator cost'),
    data: `$${formatCash(validatorCost)}`,
    tooltip: validatorCost?.toLocaleString(),
    blur: !validatorCost,
  });

  for (const item of networkProfileExample.headerMetrics) {
    rows.push({
      key: item.title,
      title: t(item.title as 'tvl' | 'revenue' | 'mau'),
      data: String(item.data),
      blur: true,
    });
  }

  const containerBlur = !isPow && !rows.some((r) => !r.blur);

  return (
    <div className={containerBlur ? 'flex w-full flex-col gap-1 blur-sm' : 'flex w-full flex-col gap-1'}>
      {rows.map((row) => (
        <div
          key={row.key}
          className={`my-1 flex items-center justify-between rounded bg-card py-2 pl-10 pr-2 hover:text-highlight hover:shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black] ${row.blur ? 'blur-sm pointer-events-none' : ''}`}
        >
          <span className="font-sfpro text-base">{row.title}</span>
          <div className="flex items-center">
            <span className="mr-8 font-handjet text-lg">
              {row.tooltip ? <Tooltip tooltip={row.tooltip}>{row.data}</Tooltip> : row.data}
            </span>
            <PlusButton size="xs" isOpened={false} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsHeader;
