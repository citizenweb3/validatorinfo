import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import TxService from '@/services/tx-service';
import chainService from '@/services/chain-service';
import { txExample } from '@/app/networks/[name]/tx/txExample';

interface OwnProps {
  chainName: string;
}

const TotalTxsMetrics: FC<OwnProps> = async ({ chainName }) => {
  const t = await getTranslations('TotalTxsPage');

  if (isAztecChainName(chainName)) {
    const chain = await chainService.getByName(chainName);

    if (!chain) {
      return null;
    }

    const metrics = await TxService.getAztecTxMetrics(chain.id);

    const metricsData = [
      {
        title: 'total transactions',
        data: metrics.totalTxs !== null ? metrics.totalTxs.toLocaleString('en-US') : 'N/A',
      },
      {
        title: 'transactions 30d',
        data: 'N/A',
      },
      {
        title: 'transactions yesterday',
        data: metrics.txsLast24h !== null ? metrics.txsLast24h.toLocaleString('en-US') : 'N/A',
      },
      {
        title: 'tps',
        data: 'N/A',
      },
      {
        title: 'average fee',
        data: metrics.avgFee !== null && chain.params?.coinDecimals != null
          ? `${(Number(metrics.avgFee) / 10 ** chain.params.coinDecimals).toLocaleString('en-US', { maximumSignificantDigits: 3 })} AZTEC`
          : 'N/A',
      },
    ];

    return (
      <div className="mt-8 flex w-full flex-row justify-center gap-3">
        {metricsData.map((item) => (
          <MetricsCardItem
            key={item.title}
            title={t(item.title as 'total transactions')}
            data={item.data}
            className="pb-6 pt-2.5"
            dataClassName="mt-5"
          />
        ))}
      </div>
    );
  }

  // Non-Aztec chains: existing mock data
  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'tps':
        return `${data} txs/s`;
      case 'average fee':
        return `${data} USD/tx`;
      default:
        return `${data.toLocaleString('en-US')}`;
    }
  };

  return (
    <div className="mt-8 flex w-full flex-row justify-center gap-3">
      {txExample.totalTxsMetrics.map((item) => (
        <MetricsCardItem
          key={item.title}
          title={t(item.title as 'total transactions')}
          data={formatData(item.title, item.data)}
          className="pb-6 pt-2.5"
          dataClassName="mt-5"
        />
      ))}
    </div>
  );
};

export default TotalTxsMetrics;
