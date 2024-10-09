import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import NetworksList from '@/app/networks/networks-list/networks-list';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import ChainService from '@/services/chain-service';
import { Chain } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const NetworksPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'NetworksPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const chains: Chain[] = await ChainService.getAll();
  const networksPerPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;

  return (
    <div>
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <SubTitle text={t('title')} />
      <NetworksList perPage={networksPerPage} chains={chains} currentPage={currentPage} />
    </div>
  );
};

export default NetworksPage;
