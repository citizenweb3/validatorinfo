import { getTranslations } from 'next-intl/server';

import SimpleValidators from '@/app/validators/simple-validators/simple-validators';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import SubDescription from '@/components/sub-description';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const ValidatorsPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorsPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'moniker') ?? 'moniker';
  const order = (q.order as SortDirection) ?? 'asc';
  const ecosystems: string[] = !q.ecosystems ? [] : typeof q.ecosystems === 'string' ? [q.ecosystems] : q.ecosystems;

  return (
    <div>
      <Story
        src="validators"
        alt="Pixelated, 90s game-style characters carrying gold to and out to represent total value secured"
      />
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <SimpleValidators page="HomePage" perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} ecosystems={ecosystems} />
    </div>
  );
};

export default ValidatorsPage;
