import { getTranslations } from 'next-intl/server';

import OperatorDistribution from '@/app/networks/[id]/(network-profile)/stats/operator-distribution';
import NetworkStatistics from '@/app/networks/[id]/(network-profile)/stats/network-statistics';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import SubDescription from '@/components/sub-description';
import SocialStatistics from '@/app/networks/[id]/(network-profile)/stats/social-statistics';
import SubTitle from '@/components/common/sub-title';
import TransactionVolumeChart from '@/app/networks/[id]/(network-profile)/stats/transaction-volume-chart';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkStatistics' });

  return {
    title: t('title'),
  };
}

const NetworkStatisticsPage: NextPageWithLocale<PageProps> = async ({ params: { locale, id } }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkStatistics' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  return (
    <div className="mb-16">
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NetworkStatistics chain={chain} />
      <SocialStatistics />
      <SubTitle text={t('Transaction Volume')} />
      <TransactionVolumeChart />
      <OperatorDistribution chainId={chainId} />
    </div>
  );
};

export default NetworkStatisticsPage;
