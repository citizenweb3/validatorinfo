import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import StakingStatsItem from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/staking-stats-item';
import { stakingStatsExample } from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/stakingStatsExample';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  locale: string;
}

const StakingStats: FC<OwnProps> = async ({ page, locale }) => {
  const t = await getTranslations({ locale, namespace: 'NodeRevenuePage' });

  return (
    <div className="mb-4 mt-2">
      <table className="w-full table-auto border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-table_header">
            <th className="bg-background"></th>
            <TableHeaderItem page={page} name="Yesterday" />
            <TableHeaderItem page={page} name="Last Week" />
            <TableHeaderItem page={page} name="Last Month" />
            <TableHeaderItem page={page} name="Last Year" />
          </tr>
        </thead>
        <tbody>
          <StakingStatsItem title={t('validator')} data={stakingStatsExample.validator} />
          <StakingStatsItem title={t('network')} data={stakingStatsExample.network} />
        </tbody>
      </table>
    </div>
  );
};

export default StakingStats;
