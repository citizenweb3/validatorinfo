import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import PosGlobalMetrics from '@/app/global_pos/global-metrics/pos-global-metrics';
import TotalsList from '@/app/global_pos/totals/totals-list';
import PosTvsGrow from '@/app/global_pos/tvs-grow/pos-tvs-grow';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'GlobalPosPage' });

  return {
    title: t('Metadata.title'),
  };
}

export default function GlobalPosPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);

  const t = useTranslations('GlobalPosPage');

  return (
    <div className="flex flex-col">
      <TabList page="HomePage" tabs={validatorTabs} />
      <PageTitle text={t('title')} />
      <div>
        <PosGlobalMetrics />
        <PosTvsGrow />
        <TotalsList />
      </div>
    </div>
  );
}
