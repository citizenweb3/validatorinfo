import { getTranslations } from 'next-intl/server';

import Ecosystems from '@/app/ecosystems/ecosystems-list/ecosystems';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'EcosystemsPage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const EcosystemsPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'EcosystemsPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';
  const selectedTags = Array.isArray(q.tags) ? q.tags : q.tags ? [q.tags] : [];

  return (
    <div>
      <PageHeaderVisibilityWrapper>
        <CollapsePageHeader>
          <Story src="ecosystems" alt="Pixelated, 90s game-style characters look to the ecosystems magic portal" />
        </CollapsePageHeader>
        <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      </PageHeaderVisibilityWrapper>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'pb-6'} />
      <Ecosystems page="EcosystemsPage" perPage={perPage} sort={{ sortBy, order }} currentPage={currentPage} selectedTags={selectedTags} />
    </div>
  );
};

export default EcosystemsPage;
