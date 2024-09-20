import { unstable_setRequestLocale } from 'next-intl/server';
import { unstable_cache } from 'next/cache';
import { FC } from 'react';

import ValidatorList from '@/app/validators/validator-list/validator-list';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import ChainService from '@/services/chain-service';

interface OwnProps {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { locale: Locale };
}

const getChainList = unstable_cache(ChainService.getAll, ['chains'], {
  revalidate: 3600,
  tags: ['chains'],
});

const Home: FC<OwnProps> = async ({ searchParams, params: { locale } }) => {
  unstable_setRequestLocale(locale);

  const currentPage = parseInt((searchParams.p as string) || '1');
  const chains = await getChainList();

  const filterChains: string[] = !searchParams.chains
    ? []
    : typeof searchParams.chains === 'string'
      ? [searchParams.chains]
      : searchParams.chains;

  return (
    <div>
      <TabList page="HomePage" tabs={validatorTabs} />
      <ValidatorList chains={chains} filterChains={filterChains} currentPage={currentPage} />
    </div>
  );
};

export default Home;
