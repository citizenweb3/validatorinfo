import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import type { Locale } from '@/i18n';
import { getMoneroChainParams, getMoneroTxMetrics24h } from '@/services/monero-service';
import { TAIL_EMISSION_ATOMIC, atomicToDecimal } from '@/utils/monero-emission';
import { avgFeeAtomic, tps } from '@/utils/monero-tx-metrics';

interface OwnProps {
  chainName: string;
  locale: Locale;
}

const cardClassName = 'pb-8 pt-2.5';
const dataClassName = 'mt-6 px-2 text-center leading-5';
const mutedDataClassName = `${dataClassName} blur-sm`;
const cardGridClassName =
  'mt-10 grid w-full grid-cols-[repeat(2,auto)] justify-center gap-6 md:grid-cols-[repeat(3,auto)]';

const parseAtomic = (value: string): bigint | null => {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

const formatTps = (value: number | null): string | null => {
  if (value === null) return null;
  return `${value.toFixed(3)} tx/s`;
};

const formatFee = (value: bigint | null, coinDecimals: number | null, denom: string): string | null => {
  if (value === null || coinDecimals === null) return null;

  const amount = atomicToDecimal(value, coinDecimals);
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 6, minimumFractionDigits: 6 })} ${denom}`;
};

const MoneroTxMetrics: FC<OwnProps> = async ({ chainName, locale }) => {
  if (chainName !== 'monero') return null;

  const metricsPromise = getMoneroTxMetrics24h();
  const paramsPromise = getMoneroChainParams();
  const t = await getTranslations({ locale, namespace: 'MoneroTxMetrics' });
  const [metrics, params] = await Promise.all([metricsPromise, paramsPromise]);

  const noData = t('notEnoughData');
  const hasData = metrics !== null && metrics.blockCount > 0;
  const denom = params?.denom ?? 'XMR';
  const coinDecimals = params?.coinDecimals ?? null;
  const sumRewardAtomic = metrics ? parseAtomic(metrics.sumRewardAtomic) : null;
  const windowSeconds = metrics ? metrics.windowHours * 60 * 60 : 0;
  const tpsValue = hasData && metrics ? formatTps(tps(metrics.totalTx, windowSeconds)) : null;
  const feeAtomic =
    hasData && metrics && sumRewardAtomic !== null
      ? avgFeeAtomic(sumRewardAtomic, TAIL_EMISSION_ATOMIC, metrics.blockCount, metrics.totalTx)
      : null;
  const fee = formatFee(feeAtomic, coinDecimals, denom);

  return (
    <div className={cardGridClassName}>
      <MetricsCardItem
        title={t('totalTransactions')}
        data={hasData && metrics ? metrics.totalTx.toLocaleString('en-US') : noData}
        className={cardClassName}
        dataClassName={hasData ? dataClassName : mutedDataClassName}
      />
      <MetricsCardItem
        title={t('tps')}
        data={tpsValue ?? noData}
        className={cardClassName}
        dataClassName={tpsValue ? dataClassName : mutedDataClassName}
      />
      <MetricsCardItem
        title={t('avgTxFee')}
        data={fee ?? noData}
        className={cardClassName}
        dataClassName={fee ? dataClassName : mutedDataClassName}
      />
    </div>
  );
};

export default MoneroTxMetrics;
