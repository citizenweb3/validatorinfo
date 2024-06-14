import PosGlobalMetrics from '@/app/pos/global-metrics/pos-global-metrics';
import TotalsList from '@/app/pos/totals/totals-list';
import PosTvsGrow from '@/app/pos/tvs-grow/pos-tvs-grow';
import PageTitle from '@/components/common/page-title';

export default function Home() {
  return (
    <div className="flex flex-col">
      <PageTitle text="Global POS" />
      <div>
        <PosGlobalMetrics />
        <PosTvsGrow />
        <TotalsList />
      </div>
    </div>
  );
}
