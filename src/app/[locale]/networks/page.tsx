import { getTranslations } from 'next-intl/server';

import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import Networks from '@/app/networks/networks-list/networks';
import NetworkSupportToggle from '@/app/networks/networks-list/network-support-toggle';
import ListFilters from '@/components/common/list-filters/list-filters';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const NetworksPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'NetworksPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';
  const ecosystems: string[] = !q.ecosystems ? [] : typeof q.ecosystems === 'string' ? [q.ecosystems] : q.ecosystems;
  const networkStage: string[] = !q.network_stage ? [] : typeof q.network_stage === 'string' ? [q.network_stage] : q.network_stage;
  const showAll = q.show === 'all';

  return (
    <div>
      <PageHeaderVisibilityWrapper>
        <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      </PageHeaderVisibilityWrapper>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <ListFilters
        expanded
        isEcosystems
        isNetworkStage
        perPage={perPage}
        selectedEcosystems={ecosystems}
        selectedNetworkStage={networkStage}
      >
        <NetworkSupportToggle />
      </ListFilters>
      <Networks
        page="NetworksPage"
        ecosystems={ecosystems}
        perPage={perPage}
        sort={{ sortBy, order }}
        currentPage={currentPage}
        showAll={showAll}
      />
    </div>
  );
};

export default NetworksPage;
