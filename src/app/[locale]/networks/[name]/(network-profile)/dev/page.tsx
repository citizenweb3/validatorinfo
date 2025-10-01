import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import PeersSeedsBlocks from '@/app/networks/[name]/(network-profile)/dev/peers-seeds-blocks';
import DevInfoParameters from '@/app/networks/[name]/(network-profile)/dev/dev-info-parameters';
import DeveloperActivity from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity';
import SubDescription from '@/components/sub-description';
import { SortDirection } from '@/server/types';
import NetworkApps from '@/app/networks/[name]/(network-profile)/dev/apps-list/apps';

interface PageProps {
  params: NextPageWithLocale & { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkDevInfo' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 5;

const NetworkDevInfoPage: NextPageWithLocale<PageProps> = async ({
    params: { locale, name }, searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkDevInfo' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const chain = await chainService.getByName(name);

  return (
    <div>
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <PeersSeedsBlocks chain={chain} />
      <DevInfoParameters chain={chain} />
      <NetworkApps page={'NetworkDevInfo.Apps'}
                   perPage={perPage}
                   currentPage={currentPage}
                   sort={{ sortBy, order }} />
      <DeveloperActivity />
    </div>
  );
};

export default NetworkDevInfoPage;
