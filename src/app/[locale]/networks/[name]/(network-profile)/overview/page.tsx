import { getTranslations } from 'next-intl/server';

import NetworkAprTvs from '@/app/networks/[name]/(network-profile)/overview/network-apr-tvs';
import NetworkOverview from '@/app/networks/[name]/(network-profile)/overview/network-overview';
import TotalsListNetworkPassport from '@/app/networks/[name]/(network-profile)/overview/total-list';
import GaugeBar from '@/app/web3stats/bars/gauge-bar';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkPassport' });

  return {
    title: t('title'),
  };
}

const NetworkPassportPage: NextPageWithLocale<PageProps> = async ({ params: { locale, name } }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkPassport' });
  const chain = await chainService.getByName(name);

  return (
    <div className="mb-24">
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="mt-12 flex justify-between px-48">
        <GaugeBar value={20} label="Decentralization" />
        <GaugeBar value={50} label="Scalability" />
        <GaugeBar value={80} label="Security" />
      </div>
      <TotalsListNetworkPassport chain={chain} />
      <NetworkAprTvs chain={chain} />
      <NetworkOverview chain={chain} />
    </div>
  );
};

export default NetworkPassportPage;
