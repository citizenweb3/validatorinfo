import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import Ecosystems from '@/app/ecosystems/ecosystems-list/ecosystems';
import SubDescription from '@/components/sub-description';

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

  return (
    <div>
      <Story
        src="ecosystems"
        alt="Pixelated, 90s game-style characters look to the ecosystems magic portal"
      />
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'pb-2'} />
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
