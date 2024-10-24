import { getTranslations } from 'next-intl/server';

import Networks from '@/app/networks/networks-list/networks';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/services/validator-service';

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

  return (
    <div>
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <SubTitle text={t('title')} />
      <Networks perPage={perPage} sort={{ sortBy, order }} currentPage={currentPage} />
    </div>
  );
};

export default NetworksPage;
