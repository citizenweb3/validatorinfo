import { getTranslations } from 'next-intl/server';

import MoneroHashrateSection from '@/app/networks/[name]/(network-profile)/overview/monero-hashrate-section';
import NetworkAprTvs from '@/app/networks/[name]/(network-profile)/overview/network-apr-tvs';
import NetworkOverview from '@/app/networks/[name]/(network-profile)/overview/network-overview';
import PageTitle from '@/components/common/page-title';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface PageProps {
  params: NextPageWithLocale & { name: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkPassport' });

  return {
    title: t('title'),
  };
}

const NetworkPassportPage: NextPageWithLocale<PageProps> = async ({ params: { name, locale } }) => {
  const t = await getTranslations('NetworkPassport');
  const chain = await chainService.getByName(name);
  const isPow = chain?.consensusType === 'pow';

  return (
    <div className="mb-24">
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      </CollapsiblePageHeader>
      {!isPow && <NetworkAprTvs chain={chain} />}
      {chain?.name === 'monero' && <MoneroHashrateSection locale={locale} />}
      <NetworkOverview chain={chain} />
    </div>
  );
};

export default NetworkPassportPage;
