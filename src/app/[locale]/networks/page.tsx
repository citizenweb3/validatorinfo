import { getTranslations } from 'next-intl/server';

import NetworkHealthOverview from '@/app/networks/network-health/network-health-overview';
import Networks from '@/app/networks/networks-list/networks';
import NetworkSupportToggle from '@/app/networks/networks-list/network-support-toggle';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
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
  const selectedEcosystem = (q.ecosystem as string) || undefined;
  const showAll = q.show === 'all';

  return (
    <div>
      <PageHeaderVisibilityWrapper>
        <CollapsePageHeader>
          <Story
            src="networks"
            alt="Pixelated, 90s game-style characters connecting web cables of web3 blockchain networks"
          />
        </CollapsePageHeader>
        <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      </PageHeaderVisibilityWrapper>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NetworkHealthOverview selectedEcosystem={selectedEcosystem} searchParams={q} />
      <NetworkSupportToggle />
      <Networks
        page="HomePage"
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
