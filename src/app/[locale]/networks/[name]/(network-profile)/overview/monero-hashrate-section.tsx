import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import moneroService from '@/services/monero-service';

// The chart is a heavy client component (chart.js + zoom/crosshair plugins) — load it client-side
// only, mirroring NetworkTvsAztecChart in network-apr-tvs.tsx.
const MoneroHashrateChart = dynamic(() => import('./monero-hashrate-chart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded bg-table_row">
      <div className="font-sfpro text-lg text-white opacity-70">Loading chart...</div>
    </div>
  ),
});

interface OwnProps {
  locale: string;
}

const MoneroHashrateSection: FC<OwnProps> = async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkPassport' });
  const data = await moneroService.getMoneroChartData();

  if (data.length === 0) return null;

  return (
    <div className="mt-4">
      <SubTitle text={t('Network Hashrate')} />
      <div className="mt-8">
        <MoneroHashrateChart initialData={data} />
      </div>
    </div>
  );
};

export default MoneroHashrateSection;
