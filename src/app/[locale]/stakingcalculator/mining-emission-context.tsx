'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import { Locale } from '@/i18n';
import type { MiningEmissionContext as MiningEmissionData } from '@/utils/mining-economics-context';
import { formatXmrReward } from '@/utils/monero';

interface OwnProps {
  emission: MiningEmissionData;
  locale: Locale;
}

interface EmissionRowProps {
  label: string;
  value: string;
}

const EmissionRow: FC<EmissionRowProps> = ({ label, value }) => (
  <BaseTableRow>
    <th scope="row" className="px-2 py-3 text-left font-sfpro text-base font-normal">
      {label}
    </th>
    <BaseTableCell className="px-2 py-3 text-right text-lg">{value}</BaseTableCell>
  </BaseTableRow>
);

const MiningEmissionContext: FC<OwnProps> = ({ emission, locale }) => {
  const t = useTranslations('MiningCalculatorPage');
  const tailAmount = formatXmrReward(emission.tailEmissionAtomic, locale);
  const tailStatus = emission.tailEmissionReached
    ? t('tailEmissionReachedValue', { amount: tailAmount })
    : t('tailEmissionNotReachedValue', { amount: tailAmount });
  const annualInflation =
    emission.inflationRate === null
      ? t('notIncluded')
      : new Intl.NumberFormat(locale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          style: 'percent',
        }).format(emission.inflationRate);

  return (
    <section aria-label={t('emissionTitle')}>
      <SubTitle text={t('emissionTitle')} />
      <div className="mt-6 overflow-x-auto">
        <BaseTable className="min-w-[520px]">
          <tbody>
            <EmissionRow label={t('currentBlockSubsidy')} value={formatXmrReward(emission.blockRewardAtomic, locale)} />
            <EmissionRow label={t('tailEmissionStatus')} value={tailStatus} />
            <EmissionRow
              label={t('tailEmissionHeadroom')}
              value={formatXmrReward(emission.tailHeadroomAtomic, locale)}
            />
            <EmissionRow label={t('annualIssuance')} value={formatXmrReward(emission.annualIssuanceAtomic, locale)} />
            <EmissionRow label={t('annualInflation')} value={annualInflation} />
          </tbody>
        </BaseTable>
      </div>
    </section>
  );
};

export default MiningEmissionContext;
