import { getTranslations } from 'next-intl/server';

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

const NetworkPassportPage: NextPageWithLocale<PageProps> = async ({ params: { locale, name } }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkPassport' });
  const chain = await chainService.getByName(name);

  return (
    <div className="mb-24">
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      </CollapsiblePageHeader>
      <NetworkAprTvs chain={chain} />
      <NetworkOverview chain={chain} />
    </div>
  );
};

export default NetworkPassportPage;
