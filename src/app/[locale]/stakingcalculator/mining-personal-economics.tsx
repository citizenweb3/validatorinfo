'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import { Locale } from '@/i18n';
import { formatCurrencyDecimal } from '@/utils/format-decimal';
import type { PersonalMiningEconomics } from '@/utils/personal-mining-economics';

interface OwnProps {
  economics: PersonalMiningEconomics;
  locale: Locale;
  tokenSymbol: string;
}

interface EconomicsRowProps {
  label: string;
  value: string;
}

const EconomicsRow: FC<EconomicsRowProps> = ({ label, value }) => {
  return (
    <BaseTableRow>
      <th scope="row" className="px-2 py-3 text-left font-sfpro text-base font-normal">
        {label}
      </th>
      <BaseTableCell className="px-2 py-3 text-right text-lg">{value}</BaseTableCell>
    </BaseTableRow>
  );
};

const MiningPersonalEconomics: FC<OwnProps> = ({ economics, locale, tokenSymbol }) => {
  const t = useTranslations('MiningCalculatorPage');
  const currentPaybackValue =
    economics.currentPaybackDays === null
      ? t('currentPaybackNever')
      : t('paybackDaysValue', { days: Math.ceil(economics.currentPaybackDays).toLocaleString(locale) });
  const trendPaybackValue =
    economics.trendPayback?.status === 'paid-back'
      ? t('paybackDaysValue', { days: economics.trendPayback.days.toLocaleString(locale) })
      : economics.trendPayback?.status === 'never'
        ? t('trendPaybackNever')
        : t('notIncluded');
  const breakEvenPriceValue =
    economics.breakEvenTokenPriceUsd === null
      ? t('notIncluded')
      : formatCurrencyDecimal(economics.breakEvenTokenPriceUsd, locale);
  const breakEvenDifficultyValue =
    economics.breakEvenDifficulty === null
      ? t('breakEvenDifficultyUnbounded')
      : economics.breakEvenDifficulty.toLocaleString(locale);

  return (
    <section aria-label={t('personalEconomicsTitle')} aria-live="polite">
      <SubTitle text={t('personalEconomicsTitle')} />
      <div className="mt-6 overflow-x-auto">
        <BaseTable className="min-w-[520px]">
          <tbody>
            <EconomicsRow label={t('paybackAtCurrentDifficulty')} value={currentPaybackValue} />
            {economics.trendWindowDays !== null ? (
              <EconomicsRow label={t('paybackAtCurrentTrend')} value={trendPaybackValue} />
            ) : null}
            <EconomicsRow label={t('breakEvenTokenPrice', { symbol: tokenSymbol })} value={breakEvenPriceValue} />
            {economics.difficultyAvailable && (
              <EconomicsRow label={t('breakEvenDifficulty')} value={breakEvenDifficultyValue} />
            )}
          </tbody>
        </BaseTable>
      </div>
      <p className="mt-3 font-sfpro text-sm opacity-75">{t('personalEconomicsNote')}</p>
    </section>
  );
};

export default MiningPersonalEconomics;
