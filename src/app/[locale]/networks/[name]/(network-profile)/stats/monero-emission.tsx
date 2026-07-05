import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import PassportRow from '@/components/common/passport-row';
import SubTitle from '@/components/common/sub-title';
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

const MoneroEmission: FC = async () => {
  const t = await getTranslations('PowNetworkStats');

  const [snapshot, supplyRaw, params] = await Promise.all([
    moneroService.getMoneroNetworkSnapshot(),
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

  const circulatingValue = circulatingAmount ?? t('notEnoughData');
  const blockRewardValue =
    blockRewardAmount !== null
      ? t('perBlockValue', {
          amount: blockRewardAmount,
        })
      : t('notEnoughData');
  const annualIssuanceValue =
    annualIssuanceAmount !== null
      ? t('perYearValue', {
          amount: annualIssuanceAmount,
        })
      : t('notEnoughData');
  const annualInflationValue =
    supplyAtomic !== null && annualAtomic !== null
      ? formatPercent(inflationRate(annualAtomic, supplyAtomic)) ?? t('notEnoughData')
      : t('notEnoughData');
  const stockToFlowValue =
    supplyAtomic !== null && annualAtomic !== null
      ? (stockToFlow(supplyAtomic, annualAtomic)?.toFixed(1) ?? t('notEnoughData'))
      : t('notEnoughData');
  const tailEmissionAmount = formatAtomicTokenAmount(TAIL_EMISSION_ATOMIC, coinDecimals, denom, 2);
  const emissionPhaseValue =
    snapshot && blockRewardAtomic === TAIL_EMISSION_ATOMIC && tailEmissionAmount !== null
      ? t('tailEmission', { reward: tailEmissionAmount })
      : t('notEnoughData');

  return (
    <section>
      <SubTitle text={t('emissionTitle')} />
      <div className="mt-4">
        <PassportRow label={t('circulatingSupply')} value={circulatingValue} />
        <PassportRow label={t('blockReward')} value={blockRewardValue} />
        <PassportRow label={t('annualIssuance')} value={annualIssuanceValue} />
        <PassportRow label={t('annualInflation')} value={annualInflationValue} />
        <PassportRow label={t('stockToFlow')} value={stockToFlowValue} />
        <PassportRow label={t('emissionPhase')} value={emissionPhaseValue} />
      </div>
    </section>
  );
};

export default MoneroEmission;
