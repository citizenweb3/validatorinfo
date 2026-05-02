import { getTranslations } from 'next-intl/server';

import Ecosystems from '@/app/ecosystems/ecosystems-list/ecosystems';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import SubTitle from '@/components/common/sub-title';

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

const defaultPerPage = 25;

const EcosystemsPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'EcosystemsPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';
  const selectedTags = Array.isArray(q.tags) ? q.tags : q.tags ? [q.tags] : [];

  return (
    <div>
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <SubTitle text={t('UnderConstruction')} className={'mt-4'} />
      <Ecosystems page="EcosystemsPage" perPage={perPage} sort={{ sortBy, order }} currentPage={currentPage}
                  selectedTags={selectedTags} />
    </div>
  );
};

export default EcosystemsPage;
