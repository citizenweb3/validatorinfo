import PosGlobalMetrics from '@/app/global_pos/global-metrics/pos-global-metrics';
import TotalsList from '@/app/global_pos/totals/totals-list';
import PosTvsGrow from '@/app/global_pos/tvs-grow/pos-tvs-grow';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';

export default function Home() {
  return (
    <div className="flex flex-col">
      <TabList tabs={validatorTabs} />
      <PageTitle text="Global POS" />
      <div>
        <PosGlobalMetrics />
        <PosTvsGrow />
        <TotalsList />
      </div>
    </div>
  );
}
