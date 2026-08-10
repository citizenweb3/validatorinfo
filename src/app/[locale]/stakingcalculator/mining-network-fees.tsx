'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import { Locale } from '@/i18n';
import type { MiningNetworkFees as MiningNetworkFeeData } from '@/utils/mining-economics-context';
import { formatXmrReward } from '@/utils/monero';

interface OwnProps {
  fees: MiningNetworkFeeData;
  locale: Locale;
}

interface FeeRowProps {
  label: string;
  value: string;
}

const FeeRow: FC<FeeRowProps> = ({ label, value }) => (
  <BaseTableRow>
    <th scope="row" className="px-2 py-3 text-left font-sfpro text-base font-normal">
      {label}
    </th>
    <BaseTableCell className="px-2 py-3 text-right text-lg">{value}</BaseTableCell>
  </BaseTableRow>
);

const MiningNetworkFees: FC<OwnProps> = ({ fees, locale }) => {
  const t = useTranslations('MiningCalculatorPage');
  const unavailable = t('notIncluded');
  const averageFee = fees.averageFeeAtomic === null ? unavailable : formatXmrReward(fees.averageFeeAtomic, locale);
  const feeShare =
    fees.feeShare === null
      ? unavailable
      : new Intl.NumberFormat(locale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          style: 'percent',
        }).format(fees.feeShare);
  const transactions = fees.transactionsPerDay?.toLocaleString(locale) ?? unavailable;

  return (
    <section aria-label={t('networkFeesTitle')}>
      <SubTitle text={t('networkFeesTitle')} />
      <div className="mt-6 overflow-x-auto">
        <BaseTable className="min-w-[520px]">
          <tbody>
            <FeeRow label={t('averageTransactionFee24h')} value={averageFee} />
            <FeeRow label={t('feeShareOfReward')} value={feeShare} />
            <FeeRow label={t('transactionsPerDay')} value={transactions} />
          </tbody>
        </BaseTable>
      </div>
    </section>
  );
};

export default MiningNetworkFees;
