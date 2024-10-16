import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import PosGlobalMetrics from '@/app/global_pos/global-metrics/pos-global-metrics';
import TotalsList from '@/app/global_pos/totals/totals-list';
import PosTvsGrow from '@/app/global_pos/tvs-grow/pos-tvs-grow';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import HeaderInfoService from '@/services/headerInfo-service';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'GlobalPosPage' });
  return {
    title: t('Metadata.title'),
  };
}

export default async function GlobalPosPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('GlobalPosPage');

  const headerInfo = await HeaderInfoService.getValidatorsAndChains();
  const data = [
    { title: 'total validators', data: headerInfo.validators },
    { title: 'total networks', data: headerInfo.chains },
    { title: 'total pages', data: 234 },
    { title: 'total ecosystems', data: 23 },
    { title: 'unknown', data: 0 },
  ];

  return (
    <div className="flex flex-col">
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <div>
        <PosGlobalMetrics />
        <PosTvsGrow />
        <TotalsList data={data} />
      </div>
    </div>
  );
}
