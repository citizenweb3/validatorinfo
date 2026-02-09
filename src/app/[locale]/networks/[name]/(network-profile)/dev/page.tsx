import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import DevRepositoryToggle from '@/app/networks/[name]/(network-profile)/dev/dev-repository-toggle';
import DeveloperActivity from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity';
import DeveloperActivityTable
  from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-table';
import DevInfoParameters from '@/app/networks/[name]/(network-profile)/dev/dev-info-parameters';
import PeersSeedsBlocks from '@/app/networks/[name]/(network-profile)/dev/peers-seeds-blocks';
import SubDescription from '@/components/sub-description';
import { SortDirection } from '@/server/types';
import githubService from '@/services/github-service';
import SubTitle from '@/components/common/sub-title';

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
  const tActivity = await getTranslations({ locale, namespace: 'NetworkDevInfo.DeveloperActivity' });
  const repositories = chain ? await githubService.getRepositoriesWithCommits(chain.id) : [];

  return (
    <div>
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <SubTitle text={t('Parameters')} />
      <DevInfoParameters chain={chain} />
      <PeersSeedsBlocks chain={chain} />
      <DevRepositoryToggle
        subtitleText={tActivity('Subtitle')}
        showLabel={tActivity('show dropdown')}
        hideLabel={tActivity('hide dropdown')}
        table={<DeveloperActivityTable items={repositories} />}
      >
        <DeveloperActivity chain={chain} />
      </DevRepositoryToggle>

      {/*// will be replaced to another page*/}
      {/*<NetworkApps page={'NetworkDevInfo.Apps'}*/}
      {/*             perPage={perPage}*/}
      {/*             currentPage={currentPage}*/}
      {/*             sort={{ sortBy, order }} />*/}
    </div>
  );
};

export default NetworkDevInfoPage;
