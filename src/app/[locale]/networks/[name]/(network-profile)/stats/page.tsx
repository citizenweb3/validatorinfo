import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import NetworkStatistics from '@/app/networks/[name]/(network-profile)/stats/network-statistics';
import OperatorDistribution from '@/app/networks/[name]/(network-profile)/stats/operator-distribution';
import OperatorDistributionSkeleton from '@/app/networks/[name]/(network-profile)/stats/operator-distribution-skeleton';
import SocialStatistics from '@/app/networks/[name]/(network-profile)/stats/social-statistics';
import TransactionVolumeChart from '@/app/networks/[name]/(network-profile)/stats/transaction-volume-chart';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkStatistics' });

  return {
    title: t('title'),
  };
}

const NetworkStatisticsPage: NextPageWithLocale<PageProps> = async ({ params: { locale, name } }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkStatistics' });
  const chain = await chainService.getByName(name);

  return (
    <div className="mb-16">
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NetworkStatistics chain={chain} />
      <SocialStatistics chain={chain} />
      <SubTitle text={t('Transaction Volume')} />
      <TransactionVolumeChart />
      <Suspense fallback={<OperatorDistributionSkeleton />}>
        <OperatorDistribution chain={chain} />
      </Suspense>
    </div>
  );
};

export default NetworkStatisticsPage;
