import { FC } from 'react';
import { formatMoneyAmount } from '@/utils/format-money-amount';

interface Periods {
  amount: number;
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

const StakingStatsItem: FC<OwnProps> = ({ title, data }) => {
  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="border-b border-black bg-table_header px-2 py-2 font-sfpro text-sm font-bold hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{title}</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-base hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{formatMoneyAmount(data.yesterday.amount)}</div>
        <div className="flex items-center justify-center">[{data.yesterday.percents}%]</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-base hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{formatMoneyAmount(data.lastWeek.amount)}</div>
        <div className="flex items-center justify-center">[{data.lastWeek.percents}%]</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-base hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{formatMoneyAmount(data.lastMonth.amount)}</div>
        <div className="flex items-center justify-center">[{data.lastMonth.percents}%]</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-base hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{formatMoneyAmount(data.lastYear.amount)}</div>
        <div className="flex items-center justify-center">[{data.lastYear.percents}%]</div>
      </td>
    </tr>
  );
};

export default StakingStatsItem;
