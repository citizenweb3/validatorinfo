import { getTranslations } from 'next-intl/server';

import OperatorDistribution from '@/app/networks/[id]/statistics/operator-distribution';
import TotalStatistics from '@/app/networks/[id]/statistics/total-statistics';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

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
    <div className="mb-20">
      <PageTitle text={chain?.prettyName ?? 'Network'} />
      <TotalStatistics />
      <OperatorDistribution />
    </div>
  );
};

export default NetworkStatisticsPage;
