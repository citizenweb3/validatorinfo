import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import NetworkStatistics from '@/app/networks/[name]/(network-profile)/stats/network-statistics';
import OperatorDistribution from '@/app/networks/[name]/(network-profile)/stats/operator-distribution';
import OperatorDistributionSkeleton from '@/app/networks/[name]/(network-profile)/stats/operator-distribution-skeleton';
import PowNetworkStats from '@/app/networks/[name]/(network-profile)/stats/pow-network-stats';
import SocialStatistics from '@/app/networks/[name]/(network-profile)/stats/social-statistics';
import TransactionVolumeChart from '@/app/networks/[name]/(network-profile)/stats/transaction-volume-chart';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import { HashrateWindow } from '@/services/monero-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkStatistics' });

  return {
    title: t('title'),
  };
}

const NetworkStatisticsPage: NextPageWithLocale<PageProps> = async ({
  params: { name },
  searchParams,
}) => {
  const t = await getTranslations('NetworkStatistics');
  const chain = await chainService.getByName(name);

  const isPow = chain?.consensusType === 'pow';
  const rawWindow = Array.isArray(searchParams.window) ? searchParams.window[0] : searchParams.window;
  const windowParam = (rawWindow ?? '24h') as HashrateWindow;

  return (
    <div className="mb-16">
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      </CollapsiblePageHeader>
      {!isPow && <SubTitle text={t('UnderConstruction')} className={'my-4'} />}
      {isPow && chain ? (
        <Suspense fallback={null}>
          <PowNetworkStats window={windowParam} />
        </Suspense>
      ) : (
        <>
          <NetworkStatistics chain={chain} />
          <SubTitle text={t('Transaction Volume')} />
          <TransactionVolumeChart />
        </>
      )}
      <SocialStatistics chain={chain} />
      {/* Operator/validator distribution — N/A for PoW (no validators). Shown but blurred + disabled. */}
      <div className={isPow ? 'blur-sm pointer-events-none' : ''}>
        <Suspense fallback={<OperatorDistributionSkeleton />}>
          <OperatorDistribution chain={chain} />
        </Suspense>
      </div>
    </div>
  );
};

export default NetworkStatisticsPage;
