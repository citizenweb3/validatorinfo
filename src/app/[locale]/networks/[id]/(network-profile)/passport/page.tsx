import { getTranslations } from 'next-intl/server';

import DecentralizationBar from '@/app/global/bars/decentralization-bar';
import ScalabilityBar from '@/app/global/bars/scalability-bar';
import SecurityBar from '@/app/global/bars/security-bar';
import NetworkAprTvs from '@/app/networks/[id]/(network-profile)/passport/network-apr-tvs';
import NetworkOverview from '@/app/networks/[id]/(network-profile)/passport/network-overview';
import TotalsListNetworkPassport from '@/app/networks/[id]/(network-profile)/passport/total-list';
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
    <div className="mb-24">
      <PageTitle text={chain?.prettyName ?? 'Network'} />
      <div className="mt-12 flex justify-between px-48">
        <DecentralizationBar />
        <ScalabilityBar />
        <SecurityBar />
      </div>
      <TotalsListNetworkPassport />
      <NetworkAprTvs />
      <NetworkOverview chain={chain ?? undefined} />
    </div>
  );
};

export default NetworkPassportPage;
