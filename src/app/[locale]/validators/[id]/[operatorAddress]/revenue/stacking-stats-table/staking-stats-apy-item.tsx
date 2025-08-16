import { FC } from 'react';

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
    <tr className="group cursor-pointer hover:bg-bgHover font-handjet text-lg">
      <td
        className="border-b border-black bg-table_header px-2 py-5 hover:text-highlight font-sfpro text-base active:border-bgSt">
        <div className="flex items-center justify-center">{title}</div>
      </td>
      <td className="border-b border-black px-2 py-5 font-handjet hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{data.yesterday.percents}%</div>
      </td>
      <td className="border-b border-black px-2 py-5 hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{data.lastWeek.percents}%</div>
      </td>
      <td className="border-b border-black px-2 py-5 hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{data.lastMonth.percents}%</div>
      </td>
      <td className="border-b border-black px-2 py-5 hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center">{data.lastYear.percents}%</div>
      </td>
    </tr>
  );
};

export default StakingStatsApyItem;
