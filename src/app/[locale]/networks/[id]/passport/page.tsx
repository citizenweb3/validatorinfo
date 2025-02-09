import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import DecentralizationBar from '@/app/global/bars/decentralization-bar';
import ScalabilityBar from '@/app/global/bars/scalability-bar';
import SecurityBar from '@/app/global/bars/security-bar';
import NetworkAprTvs from '@/app/networks/[id]/passport/network-apr-tvs';
import NetworkOverview from '@/app/networks/[id]/passport/network-overview';
import TotalsListNetworkPassport from '@/app/networks/[id]/passport/total-list';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

interface PageProps {
  params: NextPageWithLocale & { id: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkPassport' });

  return {
    title: t('title'),
  };
}

const NetworkPassportPage: NextPageWithLocale<PageProps> = async ({ params: { id } }) => {
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  return (
    <div className="mb-20">
      <PageTitle text={chain?.prettyName ?? 'Network'} />
      <div className="mt-16 flex justify-between px-36">
        <DecentralizationBar />
        <ScalabilityBar />
        <SecurityBar />
      </div>
      <Suspense fallback={<div />}>
        <TotalsListNetworkPassport />
      </Suspense>
      <NetworkAprTvs />
      {chain && <NetworkOverview chain={chain} />}
    </div>
  );
};

export default NetworkPassportPage;
