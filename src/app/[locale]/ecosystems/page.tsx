import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import Ecosystems from '@/app/ecosystems/ecosystems-list/ecosystems';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const EcosystemsPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'EcosystemsPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';
  const ecosystems: string[] = !q.ecosystems ? [] : typeof q.ecosystems === 'string' ? [q.ecosystems] : q.ecosystems;

  return (
    <div>
      <Story
        src="ecosystems"
        alt="Pixelated, 90s game-style characters look on the ecosystems magic portal"
      />
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <PageTitle text={t('title')} />
      <Ecosystems
        page="EcosystemsPage"
        perPage={perPage}
        sort={{ sortBy, order }}
        currentPage={currentPage}
      />
    </div>
  );
};

export default EcosystemsPage;
