import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import PosGlobalMetrics from '@/app/global_pos/global-metrics/pos-global-metrics';
import TotalsList from '@/app/global_pos/totals/totals-list';
import PosTvsGrow from '@/app/global_pos/tvs-grow/pos-tvs-grow';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'GlobalPosPage' });
  return {
    title: t('Metadata.title'),
  };
}

export default async function GlobalPosPage() {
  const t = await getTranslations('GlobalPosPage');

  return (
    <div className="flex flex-col">
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <div>
        <PosGlobalMetrics />
        <PosTvsGrow />
        <Suspense fallback={<div />}>
          <TotalsList />
        </Suspense>
      </div>
    </div>
  );
}
