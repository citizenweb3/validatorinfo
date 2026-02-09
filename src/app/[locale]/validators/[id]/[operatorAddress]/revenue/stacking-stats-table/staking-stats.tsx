import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import StakingStatsItem from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/staking-stats-item';
import {
  stakingStatsExample,
} from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/stakingStatsExample';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';
import StakingStatsApyItem
  from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/staking-stats-apy-item';

interface OwnProps extends PagesProps {
  locale: string;
}

const StakingStats: FC<OwnProps> = async ({ page, locale }) => {
  const t = await getTranslations({ locale, namespace: 'NodeRevenuePage' });

  return (
    <div className="mb-4 mt-2">
      <BaseTable>
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
        <StakingStatsApyItem title={'APY'} data={stakingStatsExample.apy} />
        </tbody>
      </BaseTable>
    </div>
  );
};

export default StakingStats;
