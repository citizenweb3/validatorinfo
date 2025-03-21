import { getTranslations } from 'next-intl/server';

import OperatorDistribution from '@/app/networks/[id]/(network-profile)/statistics/operator-distribution';
import NetworkStatistics from '@/app/networks/[id]/(network-profile)/statistics/network-statistics';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

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

const NetworkStatisticsPage: NextPageWithLocale<PageProps> = async ({ params: { id } }) => {
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  return (
    <div className="mb-16">
      <PageTitle text={chain?.prettyName ?? 'Network'} />
      <NetworkStatistics chain={chain} />
      <OperatorDistribution chainId={chainId} />
    </div>
  );
};

export default NetworkStatisticsPage;
