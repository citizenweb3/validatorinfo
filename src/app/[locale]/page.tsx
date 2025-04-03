import Validators from '@/app/main-validators/validator-list/validators';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { SortDirection } from '@/server/types';
import { NextPageWithLocale } from '@/i18n';
import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const Home: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const currentPage = parseInt((q.p as string) || '1');
  const validatorsPerPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const ecosystems: string[] = !q.ecosystems ? [] : typeof q.ecosystems === 'string' ? [q.ecosystems] : q.ecosystems;
  const sortBy = (q.sortBy as 'moniker' | 'nodes' | undefined) ?? undefined;
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <SubDescription text={t('sub description')} contentClassName={'mx-4 my-2'} />
      <Validators
        page="HomePage"
        sort={{ sortBy, order }}
        perPage={validatorsPerPage}
        ecosystems={ecosystems}
        currentPage={currentPage}
      />
    </div>
  );
};

export default Home;
