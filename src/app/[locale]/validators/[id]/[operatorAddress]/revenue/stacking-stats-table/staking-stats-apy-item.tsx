import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';

interface Periods {
  percents: number;
}

interface Stats {
  yesterday: Periods;
  lastWeek: Periods;
  lastMonth: Periods;
  lastYear: Periods;
}

interface OwnProps {
  title: string;
  data: Stats;
}

const StakingStatsApyItem: FC<OwnProps> = ({ title, data }) => {
  return (
    <BaseTableRow className="font-handjet text-lg">
      <BaseTableCell className="px-2 py-5 hover:text-highlight font-sfpro text-base">
        <div className="flex items-center justify-center">{title}</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-5 font-handjet hover:text-highlight">
        <div className="flex items-center justify-center">{data.yesterday.percents}%</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-5 hover:text-highlight">
        <div className="flex items-center justify-center">{data.lastWeek.percents}%</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-5 hover:text-highlight">
        <div className="flex items-center justify-center">{data.lastMonth.percents}%</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-5 hover:text-highlight">
        <div className="flex items-center justify-center">{data.lastYear.percents}%</div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default StakingStatsApyItem;
