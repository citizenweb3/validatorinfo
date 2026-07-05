import { getTranslations } from 'next-intl/server';
import { FC, ReactNode } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Tooltip from '@/components/common/tooltip';
import moneroService from '@/services/monero-service';
import formatCash from '@/utils/format-cash';
import {
  TAIL_EMISSION_ATOMIC,
  annualIssuanceAtomic,
  atomicToDecimal,
  estimateBaseRewardAtomic,
  inflationRate,
  parseAtomicAmount,
  stockToFlow,
} from '@/utils/monero-emission';

interface OwnProps {
  chainName: string | null;
}

const cardClassName = 'pb-8 pt-2.5';
const dataClassName = 'mt-6 px-2 text-center leading-5';
const mutedDataClassName = `${dataClassName} blur-sm`;

const formatTokenAmount = (value: number, denom: string, decimals = 1): string => {
  return `${formatCash(value, decimals).trim()} ${denom}`;
};

const formatAtomicTokenAmount = (
  value: bigint | null,
  coinDecimals: number | null,
  denom: string,
  decimals = 1,
): string | null => {
  if (value === null || coinDecimals === null) return null;
  return formatTokenAmount(atomicToDecimal(value, coinDecimals), denom, decimals);
};

const formatPercent = (value: number | null): string | null => {
  if (value === null) return null;
  return `${(value * 100).toFixed(2)}%`;
};

const cardGridClassName = 'grid w-full grid-cols-[repeat(2,auto)] justify-center gap-6 md:grid-cols-[repeat(4,auto)]';

const withTooltip = (value: string, tooltip: string | null): ReactNode => {
  if (!tooltip) return value;

  return (
    <Tooltip tooltip={tooltip}>
      <div className="text-center">{value}</div>
    </Tooltip>
  );
};

const PowTokenomicsParams: FC<OwnProps> = async ({ chainName }) => {
  const t = await getTranslations('NetworkTokenomics');
  const noData = t('not enough data');

  if (chainName !== 'monero') {
    return (
      <div className={cardGridClassName}>
        {[
          t('circulating supply'),
          t('block reward'),
          t('annual issuance'),
          t('annual inflation'),
          t('stock-to-flow'),
          t('emission phase'),
        ].map((title) => (
          <MetricsCardItem
            key={title}
            title={title}
            data={noData}
            className={cardClassName}
            dataClassName={mutedDataClassName}
          />
        ))}
      </div>
    );
  }

  const [supplyRaw, params] = await Promise.all([
    moneroService.getMoneroSupply(),
    moneroService.getMoneroChainParams(),
  ]);

  const supplyAtomic = parseAtomicAmount(supplyRaw);
  const coinDecimals = params?.coinDecimals ?? null;
  const denom = params?.denom ?? 'XMR';

  const blockRewardAtomic = supplyAtomic !== null ? estimateBaseRewardAtomic(supplyAtomic) : null;
  const annualAtomic = blockRewardAtomic !== null ? annualIssuanceAtomic(blockRewardAtomic) : null;
  const circulatingAmount = formatAtomicTokenAmount(supplyAtomic, coinDecimals, denom);
  const blockRewardAmount = formatAtomicTokenAmount(blockRewardAtomic, coinDecimals, denom, 2);
  const annualIssuanceAmount = formatAtomicTokenAmount(annualAtomic, coinDecimals, denom);
  const tailEmissionAmount = formatAtomicTokenAmount(TAIL_EMISSION_ATOMIC, coinDecimals, denom, 2);

  const exactCirculatingSupply =
    supplyAtomic !== null && coinDecimals !== null
      ? `${atomicToDecimal(supplyAtomic, coinDecimals).toLocaleString()} ${denom}`
      : null;
  const circulatingValue = circulatingAmount
    ? withTooltip(circulatingAmount, exactCirculatingSupply)
    : noData;
  const blockRewardValue =
    blockRewardAmount !== null ? t('per block value', { amount: blockRewardAmount }) : noData;
  const annualIssuanceValue =
    annualIssuanceAmount !== null ? t('per year value', { amount: annualIssuanceAmount }) : noData;
  const annualInflationValue =
    supplyAtomic !== null && annualAtomic !== null
      ? formatPercent(inflationRate(annualAtomic, supplyAtomic)) ?? noData
      : noData;
  const stockToFlowValue =
    supplyAtomic !== null && annualAtomic !== null
      ? (stockToFlow(supplyAtomic, annualAtomic)?.toFixed(1) ?? noData)
      : noData;
  const isTailEmission = blockRewardAtomic === TAIL_EMISSION_ATOMIC && tailEmissionAmount !== null;
  const emissionPhaseLine = isTailEmission ? t('per block value', { amount: tailEmissionAmount }) : '';
  const emissionPhaseValue = isTailEmission ? withTooltip(emissionPhaseLine, t('tail emission')) : noData;

  return (
    <div className={cardGridClassName}>
      <MetricsCardItem
        title={t('circulating supply')}
        data={circulatingValue}
        className={cardClassName}
        dataClassName={dataClassName}
      />
      <MetricsCardItem
        title={t('block reward')}
        data={blockRewardValue}
        className={cardClassName}
        dataClassName={dataClassName}
      />
      <MetricsCardItem
        title={t('annual issuance')}
        data={annualIssuanceValue}
        className={cardClassName}
        dataClassName={dataClassName}
      />
      <MetricsCardItem
        title={t('annual inflation')}
        data={annualInflationValue}
        className={cardClassName}
        dataClassName={dataClassName}
      />
      <MetricsCardItem
        title={t('stock-to-flow')}
        data={stockToFlowValue}
        className={cardClassName}
        dataClassName={dataClassName}
      />
      <MetricsCardItem
        title={t('emission phase')}
        data={emissionPhaseValue}
        className={cardClassName}
        dataClassName={dataClassName}
      />
    </div>
  );
};

export default PowTokenomicsParams;
