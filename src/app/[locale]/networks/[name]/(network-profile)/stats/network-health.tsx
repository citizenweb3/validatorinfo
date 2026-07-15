import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import PassportRow, { signalColors } from '@/components/common/passport-row';
import SubTitle from '@/components/common/sub-title';
import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';
import moneroService, { HashrateWindow, MoneroPoolStatsRow } from '@/services/monero-service';
import { TAIL_EMISSION_ATOMIC, parseAtomicAmount } from '@/utils/monero-emission';
import { rewardComposition } from '@/utils/monero-tx-metrics';
import { blockTimeStats, difficultyStability, hhi, nakamotoCoefficient } from '@/utils/pow-decentralization';

interface OwnProps {
  poolStats: MoneroPoolStatsRow[];
  window: HashrateWindow;
}

const concentrationLabelKeys = {
  competitive: 'concentrationCompetitive',
  moderate: 'concentrationModerate',
  concentrated: 'concentrationConcentrated',
} as const;

const difficultyLabelKeys = {
  stable: 'difficultyStable',
  moderate: 'difficultyModerate',
  volatile: 'difficultyVolatile',
} as const;

const formatPercent = (value: number, digits = 1): string => `${(value * 100).toFixed(digits)}%`;

const nakamotoColor = (count: number | null, isLowerBound: boolean): string | undefined => {
  if (count === null) return undefined;
  if (isLowerBound) return signalColors.green;
  if (count <= 2) return signalColors.red;
  if (count <= 4) return signalColors.yellow;
  return signalColors.green;
};

const hhiBand = (value: number | null): 'competitive' | 'moderate' | 'concentrated' | null => {
  if (value === null) return null;
  if (value < 1500) return 'competitive';
  if (value < 2500) return 'moderate';
  return 'concentrated';
};

const hhiColor = (band: ReturnType<typeof hhiBand>): string | undefined => {
  if (band === 'competitive') return signalColors.green;
  if (band === 'moderate') return signalColors.yellow;
  if (band === 'concentrated') return signalColors.red;
  return undefined;
};

const blockTimeColor = (averageSeconds: number | null, coefficientOfVariation: number | null): string | undefined => {
  if (averageSeconds === null || coefficientOfVariation === null) return undefined;

  const targetDeviation = Math.abs(averageSeconds - MONERO_BLOCK_TIME_SECONDS) / MONERO_BLOCK_TIME_SECONDS;
  if (targetDeviation <= 0.1 && coefficientOfVariation <= 0.25) return signalColors.green;
  if (targetDeviation <= 0.25 && coefficientOfVariation <= 0.5) return signalColors.yellow;
  return signalColors.red;
};

const difficultyBand = (coefficientOfVariation: number | null): 'stable' | 'moderate' | 'volatile' | null => {
  if (coefficientOfVariation === null) return null;
  if (coefficientOfVariation <= 0.05) return 'stable';
  if (coefficientOfVariation <= 0.15) return 'moderate';
  return 'volatile';
};

const difficultyColor = (band: ReturnType<typeof difficultyBand>): string | undefined => {
  if (band === 'stable') return signalColors.green;
  if (band === 'moderate') return signalColors.yellow;
  if (band === 'volatile') return signalColors.red;
  return undefined;
};

const NetworkHealth: FC<OwnProps> = async ({ poolStats, window }) => {
  const [t, hashrateHistory, txMetrics] = await Promise.all([
    getTranslations('PowNetworkStats'),
    moneroService.getMoneroHashrateHistory(window),
    moneroService.getMoneroTxMetrics24h(),
  ]);

  const nakamoto = nakamotoCoefficient(poolStats);
  const hhiResult = hhi(poolStats);
  const concentration = hhiBand(hhiResult.value);
  const blockTime = blockTimeStats(hashrateHistory);
  const difficulty = difficultyStability(hashrateHistory);
  const difficultyStatus = difficultyBand(difficulty.coefficientOfVariation);
  const sumRewardAtomic = txMetrics ? parseAtomicAmount(txMetrics.sumRewardAtomic) : null;
  const composition = txMetrics && sumRewardAtomic !== null
    ? rewardComposition(sumRewardAtomic, TAIL_EMISSION_ATOMIC, txMetrics.feeBlockCount)
    : null;

  const nakamotoValue =
    nakamoto.count === null
      ? t('notEnoughData')
      : nakamoto.isLowerBound
        ? t('nakamotoLowerBound', { count: nakamoto.count })
        : nakamoto.count.toLocaleString();

  const hhiValue =
    hhiResult.value === null || concentration === null
      ? t('notEnoughData')
      : t('hhiValue', {
          value: Math.round(hhiResult.value).toLocaleString(),
          status: t(concentrationLabelKeys[concentration]),
        });

  const blockTimeValue =
    blockTime.averageSeconds === null || blockTime.coefficientOfVariation === null
      ? t('notEnoughData')
      : t('blockTimeValue', {
          seconds: blockTime.averageSeconds.toFixed(1),
          variability: formatPercent(blockTime.coefficientOfVariation),
        });

  const difficultyValue =
    difficulty.coefficientOfVariation === null || difficultyStatus === null
      ? t('notEnoughData')
      : t('difficultyValue', {
          variability: formatPercent(difficulty.coefficientOfVariation, 2),
          status: t(difficultyLabelKeys[difficultyStatus]),
        });

  const feeShareValue = composition
    ? t('feeShareValue', {
        fees: formatPercent(composition.feeShare),
        subsidy: formatPercent(composition.subsidyShare),
      })
    : t('notEnoughData');

  return (
    <section>
      <SubTitle text={t('networkHealth')} />
      <div className="mt-4">
        <PassportRow
          label={t('nakamoto')}
          value={nakamotoValue}
          color={nakamotoColor(nakamoto.count, nakamoto.isLowerBound)}
        />
        <PassportRow label={t('hhi')} value={hhiValue} color={hhiColor(concentration)} />
        <PassportRow
          label={t('avgBlockTime')}
          value={blockTimeValue}
          color={blockTimeColor(blockTime.averageSeconds, blockTime.coefficientOfVariation)}
        />
        <PassportRow
          label={t('difficultyStability')}
          value={difficultyValue}
          color={difficultyColor(difficultyStatus)}
        />
        <PassportRow label={t('feeShare')} value={feeShareValue} />
      </div>
    </section>
  );
};

export default NetworkHealth;
